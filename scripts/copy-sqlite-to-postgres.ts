/**
 * Copies the rows of a SQLite database file into the Postgres database in DATABASE_URL.
 *   npm run db:copy-seed                       # shared content only (prisma/production-seed.db)
 *   npm run db:copy-seed -- prisma/dev.db      # everything, including users and their learning data
 *   ... -- --if-empty                          # do nothing when the database already has words (used by the Vercel build)
 *
 * Run it after `npm run db:deploy` (tables must exist). It is safe to run again: rows that already
 * exist (same id) are skipped. Works for any model in the Prisma schema, in foreign-key order.
 */
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Prisma, PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const ifEmpty = args.includes("--if-empty");
const sourcePath = path.resolve(args.find((a) => !a.startsWith("--")) ?? path.join("prisma", "production-seed.db"));
const BATCH = 500;

type Model = (typeof Prisma.dmmf.datamodel.models)[number];
type Field = Model["fields"][number];

/** Models sorted so that every model comes after the models its foreign keys point to. */
function sortByDependency(models: readonly Model[]): Model[] {
  const byName = new Map(models.map((m) => [m.name, m]));
  const done = new Set<string>();
  const out: Model[] = [];
  const visit = (m: Model) => {
    if (done.has(m.name)) return;
    done.add(m.name);
    for (const f of m.fields) {
      if (f.relationFromFields?.length && f.type !== m.name) {
        const dep = byName.get(f.type);
        if (dep) visit(dep);
      }
    }
    out.push(m);
  };
  models.forEach(visit);
  return out;
}

/** SQLite value -> value Prisma expects for this field. */
function convert(field: Field, value: unknown): unknown {
  if (value === null || value === undefined) return null;
  switch (field.type) {
    case "DateTime":
      return new Date(typeof value === "number" || typeof value === "bigint" ? Number(value) : String(value));
    case "Boolean":
      return Number(value) === 1 || value === true || value === "1";
    case "Json":
      return typeof value === "string" ? JSON.parse(value) : value;
    case "Int":
    case "Float":
      return Number(value);
    case "BigInt":
      return BigInt(value as number);
    case "Bytes":
      return Buffer.from(value as Uint8Array);
    default:
      return value; // String and enums
  }
}

async function main() {
  const src = new DatabaseSync(sourcePath, { readOnly: true });
  const tables = new Set(
    (src.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map((r) => r.name),
  );
  // Rows whose foreign key points at a missing parent (left behind by old deletes) would be rejected by Postgres.
  const orphans = new Set(
    (src.prepare("PRAGMA foreign_key_check").all() as { table: string; rowid: number }[]).map((r) => `${r.table}:${r.rowid}`),
  );
  const db = new PrismaClient();
  try {
    if (ifEmpty && (await db.vocabularyWord.count()) > 0) {
      console.log("Database already has content; nothing to copy.");
      return;
    }
    for (const model of sortByDependency(Prisma.dmmf.datamodel.models)) {
      const table = model.dbName ?? model.name;
      if (!tables.has(table)) continue;
      const fields = model.fields.filter((f) => f.kind !== "object");
      const all = src.prepare(`SELECT rowid AS "__rowid", * FROM "${table}"`).all() as Record<string, unknown>[];
      const rows = all.filter((r) => !orphans.has(`${table}:${r.__rowid}`));
      if (rows.length < all.length) console.warn(`${model.name}: skipping ${all.length - rows.length} orphaned row(s)`);
      if (!rows.length) continue;
      const delegate = (db as unknown as Record<string, { createMany(args: unknown): Promise<{ count: number }> }>)[
        model.name[0].toLowerCase() + model.name.slice(1)
      ];
      let inserted = 0;
      for (let i = 0; i < rows.length; i += BATCH) {
        const data = rows.slice(i, i + BATCH).map((row) => {
          const rec: Record<string, unknown> = {};
          for (const f of fields) {
            const col = f.dbName ?? f.name;
            if (col in row) rec[f.name] = convert(f, row[col]);
          }
          return rec;
        });
        inserted += (await delegate.createMany({ data, skipDuplicates: true })).count;
      }
      console.log(`${model.name}: ${inserted} of ${rows.length} rows copied`);
    }
  } finally {
    await db.$disconnect();
    src.close();
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
