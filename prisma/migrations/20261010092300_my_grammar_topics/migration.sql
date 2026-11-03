-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GrammarTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "remedies" JSONB NOT NULL DEFAULT [],
    "source" TEXT NOT NULL DEFAULT 'HUMAN',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT,
    CONSTRAINT "GrammarTopic_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GrammarTopic" ("area", "explanation", "id", "level", "order", "published", "remedies", "slug", "source", "summary", "title") SELECT "area", "explanation", "id", "level", "order", "published", "remedies", "slug", "source", "summary", "title" FROM "GrammarTopic";
DROP TABLE "GrammarTopic";
ALTER TABLE "new_GrammarTopic" RENAME TO "GrammarTopic";
CREATE UNIQUE INDEX "GrammarTopic_slug_key" ON "GrammarTopic"("slug");
CREATE INDEX "GrammarTopic_area_level_idx" ON "GrammarTopic"("area", "level");
CREATE INDEX "GrammarTopic_ownerId_idx" ON "GrammarTopic"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
