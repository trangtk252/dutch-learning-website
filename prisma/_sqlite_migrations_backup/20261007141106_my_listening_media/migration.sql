-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListeningExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "topicId" TEXT,
    "description" TEXT,
    "audioUrl" TEXT,
    "durationSec" INTEGER NOT NULL,
    "isNt2" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'HUMAN',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT,
    "mediaType" TEXT,
    "sourceUrl" TEXT,
    "youtubeId" TEXT,
    "summary" TEXT,
    "needsTranscript" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ListeningExercise_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ListeningExercise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListeningExercise" ("audioUrl", "createdAt", "description", "durationSec", "id", "isNt2", "kind", "level", "published", "slug", "source", "title", "topicId") SELECT "audioUrl", "createdAt", "description", "durationSec", "id", "isNt2", "kind", "level", "published", "slug", "source", "title", "topicId" FROM "ListeningExercise";
DROP TABLE "ListeningExercise";
ALTER TABLE "new_ListeningExercise" RENAME TO "ListeningExercise";
CREATE UNIQUE INDEX "ListeningExercise_slug_key" ON "ListeningExercise"("slug");
CREATE INDEX "ListeningExercise_level_published_idx" ON "ListeningExercise"("level", "published");
CREATE INDEX "ListeningExercise_ownerId_idx" ON "ListeningExercise"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
