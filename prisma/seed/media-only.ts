/**
 * Adds ONLY the curated podcasts and film/TV recommendations (Listening → Podcasts, Film & TV).
 * Idempotent; does not create the demo learner or other content.
 *   npm run db:seed:media
 */
import { PrismaClient } from "@prisma/client";
import { PODCASTS, MEDIA } from "./media";

const db = new PrismaClient();

async function main() {
  for (const p of PODCASTS) {
    const { slug, ...data } = p;
    await db.podcast.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
  for (const m of MEDIA) {
    const { slug, providers, ...data } = m;
    const media = await db.mediaRecommendation.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    await db.watchProvider.deleteMany({ where: { mediaId: media.id } });
    await db.watchProvider.createMany({ data: providers.map((p) => ({ mediaId: media.id, name: p.name, url: p.url, access: p.access ?? null })) });
  }
  console.log(`podcasts: ${PODCASTS.length}, films/series: ${MEDIA.length}`);
}

main().finally(() => db.$disconnect());
