-- CreateTable
CREATE TABLE "GrammarNote" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "topicId"),
    CONSTRAINT "GrammarNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GrammarNote_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "GrammarTopic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
