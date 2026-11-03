-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('VOCABULARY', 'GRAMMAR', 'SPEAKING', 'LISTENING', 'READING', 'WRITING');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Nt2Program" AS ENUM ('NONE', 'PROGRAMMA_I', 'PROGRAMMA_II');

-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('HUMAN', 'AI', 'IMPORTED');

-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PREPOSITION', 'CONJUNCTION', 'PRONOUN', 'ARTICLE', 'NUMERAL', 'INTERJECTION', 'PHRASE', 'OTHER');

-- CreateEnum
CREATE TYPE "Article" AS ENUM ('DE', 'HET', 'DE_HET');

-- CreateEnum
CREATE TYPE "Auxiliary" AS ENUM ('HEBBEN', 'ZIJN', 'HEBBEN_ZIJN');

-- CreateEnum
CREATE TYPE "WordRelationType" AS ENUM ('SYNONYM', 'ANTONYM');

-- CreateEnum
CREATE TYPE "CardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateEnum
CREATE TYPE "LearningContext" AS ENUM ('MANUAL', 'READING', 'LISTENING', 'SPEAKING', 'WRITING', 'BLOG', 'GRAMMAR', 'IMPORT');

-- CreateEnum
CREATE TYPE "ErrorCategory" AS ENUM ('WORD_ORDER', 'VERB_CONJUGATION', 'SEPARABLE_VERBS', 'ARTICLES', 'DE_HET', 'PREPOSITIONS', 'PERFECT_TENSE', 'PAST_TENSE', 'ADJECTIVE_ENDINGS', 'MODAL_VERBS', 'SUBORDINATE_CLAUSES', 'RELATIVE_CLAUSES', 'PRONOUNS', 'PLURALS', 'NEGATION', 'VOCABULARY_CHOICE', 'SPELLING', 'REGISTER', 'PRONUNCIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "MistakeSource" AS ENUM ('SPEAKING', 'WRITING', 'QUIZ', 'READING', 'LISTENING', 'VOCABULARY', 'GRAMMAR');

-- CreateEnum
CREATE TYPE "GrammarArea" AS ENUM ('WORD_ORDER', 'ARTICLES', 'NOUNS', 'PRONOUNS', 'VERBS', 'MODAL_VERBS', 'PERFECT_TENSE', 'IMPERFECT_TENSE', 'FUTURE', 'SEPARABLE_VERBS', 'SUBORDINATE_CLAUSES', 'CONJUNCTIONS', 'PREPOSITIONS', 'ADJECTIVES', 'RELATIVE_CLAUSES', 'PASSIVE_VOICE', 'CONDITIONALS');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'SELECT_HEARD', 'DICTATION', 'OPEN');

-- CreateEnum
CREATE TYPE "QuestionFocus" AS ENUM ('MAIN_IDEA', 'DETAIL', 'INFERENCE', 'VOCABULARY', 'GRAMMAR');

-- CreateEnum
CREATE TYPE "QuestionSet" AS ENUM ('PRACTICE', 'QUIZ');

-- CreateEnum
CREATE TYPE "ReadingGenre" AS ENUM ('STORY', 'NEWS', 'EVERYDAY', 'EMAIL', 'WORKPLACE', 'CULTURE', 'OPINION', 'FORMAL');

-- CreateEnum
CREATE TYPE "ListeningKind" AS ENUM ('SHORT', 'DIALOGUE', 'ANNOUNCEMENT', 'MONOLOGUE', 'NT2');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('FILM', 'SERIES', 'YOUTUBE', 'NEWS', 'KIDS', 'DOCUMENTARY');

-- CreateEnum
CREATE TYPE "ConversationScenario" AS ENUM ('CASUAL', 'SUPERMARKET', 'WORK', 'DOCTOR', 'RESTAURANT', 'APPOINTMENTS', 'SMALL_TALK', 'JOB_INTERVIEW', 'BUREAUCRACY', 'RENTING', 'TRAVEL', 'NT2_SPEAKING', 'FREE');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('TEXT', 'VOICE');

-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('EMAIL', 'MESSAGE', 'FORM', 'OPINION', 'ESSAY', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "Register" AS ENUM ('INFORMAL', 'NEUTRAL', 'FORMAL');

-- CreateEnum
CREATE TYPE "AttemptKind" AS ENUM ('READING', 'LISTENING', 'GRAMMAR', 'MOCK_EXAM');

-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('PRACTICE', 'EXAM');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentLevel" "CefrLevel" NOT NULL DEFAULT 'A2',
    "targetLevel" "CefrLevel" NOT NULL DEFAULT 'B1',
    "motivation" TEXT,
    "preparingNt2" BOOLEAN NOT NULL DEFAULT false,
    "nt2Program" "Nt2Program" NOT NULL DEFAULT 'NONE',
    "examDate" TIMESTAMP(3),
    "dailyMinutes" INTEGER NOT NULL DEFAULT 20,
    "weeklyGoalDays" INTEGER NOT NULL DEFAULT 5,
    "preferredActivities" "Skill"[],
    "strengths" "Skill"[],
    "weaknesses" "Skill"[],
    "newCardsPerDay" INTEGER NOT NULL DEFAULT 10,
    "fontScale" INTEGER NOT NULL DEFAULT 100,
    "storeConversations" BOOLEAN NOT NULL DEFAULT true,
    "conversationRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "partOfSpeech" "PartOfSpeech" NOT NULL,
    "article" "Article",
    "plural" TEXT,
    "diminutive" TEXT,
    "cefrLevel" "CefrLevel",
    "ipa" TEXT,
    "audioUrl" TEXT,
    "notes" TEXT,
    "source" "ContentSource" NOT NULL DEFAULT 'HUMAN',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbForms" (
    "wordId" TEXT NOT NULL,
    "presentIk" TEXT NOT NULL,
    "presentJij" TEXT NOT NULL,
    "presentHij" TEXT NOT NULL,
    "presentWij" TEXT NOT NULL,
    "pastSingular" TEXT NOT NULL,
    "pastPlural" TEXT NOT NULL,
    "pastParticiple" TEXT NOT NULL,
    "auxiliary" "Auxiliary" NOT NULL DEFAULT 'HEBBEN',
    "separable" BOOLEAN NOT NULL DEFAULT false,
    "separablePrefix" TEXT,
    "irregular" BOOLEAN NOT NULL DEFAULT false,
    "reflexive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VerbForms_pkey" PRIMARY KEY ("wordId")
);

-- CreateTable
CREATE TABLE "AdjectiveForms" (
    "wordId" TEXT NOT NULL,
    "inflected" TEXT NOT NULL,
    "comparative" TEXT,
    "superlative" TEXT,

    CONSTRAINT "AdjectiveForms_pkey" PRIMARY KEY ("wordId")
);

-- CreateTable
CREATE TABLE "WordExample" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "dutch" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WordExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordCollocation" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "english" TEXT NOT NULL,

    CONSTRAINT "WordCollocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordRelation" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "type" "WordRelationType" NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "WordRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordTopic" (
    "wordId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "WordTopic_pkey" PRIMARY KEY ("wordId","topicId")
);

-- CreateTable
CREATE TABLE "VocabularyCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "personalNote" TEXT,
    "importance" INTEGER NOT NULL DEFAULT 2,
    "context" "LearningContext" NOT NULL DEFAULT 'MANUAL',
    "contextSentence" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "state" "CardState" NOT NULL DEFAULT 'NEW',
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "learningSteps" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" "Rating" NOT NULL,
    "stateBefore" "CardState" NOT NULL,
    "stabilityAfter" DOUBLE PRECISION NOT NULL,
    "difficultyAfter" DOUBLE PRECISION NOT NULL,
    "elapsedDays" INTEGER NOT NULL,
    "scheduledDays" INTEGER NOT NULL,
    "dueAfter" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "focus" "QuestionFocus",
    "set" "QuestionSet" NOT NULL DEFAULT 'PRACTICE',
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "readingExerciseId" TEXT,
    "listeningExerciseId" TEXT,
    "grammarTopicId" TEXT,
    "mockExamPartId" TEXT,
    "errorCategory" "ErrorCategory",

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AttemptKind" NOT NULL,
    "mode" "AttemptMode" NOT NULL DEFAULT 'PRACTICE',
    "readingExerciseId" TEXT,
    "listeningExerciseId" TEXT,
    "grammarTopicId" TEXT,
    "mockExamId" TEXT,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSec" INTEGER,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionId" TEXT,
    "answerText" TEXT,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingExercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "genre" "ReadingGenre" NOT NULL,
    "topicId" TEXT,
    "summaryEn" TEXT,
    "body" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "readingMinutes" INTEGER NOT NULL,
    "isNt2" BOOLEAN NOT NULL DEFAULT false,
    "source" "ContentSource" NOT NULL DEFAULT 'HUMAN',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingWord" (
    "readingId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "ReadingWord_pkey" PRIMARY KEY ("readingId","wordId")
);

-- CreateTable
CREATE TABLE "ListeningExercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "kind" "ListeningKind" NOT NULL,
    "topicId" TEXT,
    "description" TEXT,
    "audioUrl" TEXT,
    "durationSec" INTEGER NOT NULL,
    "isNt2" BOOLEAN NOT NULL DEFAULT false,
    "source" "ContentSource" NOT NULL DEFAULT 'HUMAN',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "speaker" TEXT,
    "text" TEXT NOT NULL,
    "startMs" INTEGER,
    "endMs" INTEGER,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningWord" (
    "exerciseId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "ListeningWord_pkey" PRIMARY KEY ("exerciseId","wordId")
);

-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "levelMin" "CefrLevel" NOT NULL,
    "levelMax" "CefrLevel" NOT NULL,
    "topics" TEXT[],
    "hasTranscripts" BOOLEAN NOT NULL DEFAULT false,
    "learningTips" TEXT,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastEpisode" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "level" "CefrLevel",
    "topic" TEXT,
    "transcriptUrl" TEXT,
    "recommendedVocabulary" TEXT[],

    CONSTRAINT "PodcastEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaRecommendation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "genre" TEXT NOT NULL,
    "levelMin" "CefrLevel" NOT NULL,
    "levelMax" "CefrLevel" NOT NULL,
    "vocabDifficulty" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dutchSubtitles" BOOLEAN NOT NULL DEFAULT false,
    "englishSubtitles" BOOLEAN NOT NULL DEFAULT false,
    "learningTips" TEXT NOT NULL,

    CONSTRAINT "MediaRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchProvider" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "access" TEXT,

    CONSTRAINT "WatchProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarTopic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "area" "GrammarArea" NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "remedies" "ErrorCategory"[],
    "source" "ContentSource" NOT NULL DEFAULT 'HUMAN',
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrammarTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarExample" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "dutch" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrammarExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarCommonMistake" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "wrong" TEXT NOT NULL,
    "correct" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "GrammarCommonMistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarTopicWord" (
    "topicId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,

    CONSTRAINT "GrammarTopicWord_pkey" PRIMARY KEY ("topicId","wordId")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenario" "ConversationScenario" NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "retainUntil" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "english" TEXT,
    "inputMode" "InputMode" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingCorrection" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "category" "ErrorCategory" NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "SpeakingCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingFeedback" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "grammarScore" INTEGER NOT NULL,
    "grammarNote" TEXT NOT NULL,
    "vocabularyScore" INTEGER NOT NULL,
    "vocabularyNote" TEXT NOT NULL,
    "fluencyScore" INTEGER NOT NULL,
    "fluencyNote" TEXT NOT NULL,
    "accuracyScore" INTEGER NOT NULL,
    "accuracyNote" TEXT NOT NULL,
    "naturalnessScore" INTEGER NOT NULL,
    "naturalnessNote" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "newVocabulary" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingPrompt" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "taskType" "WritingTaskType" NOT NULL,
    "register" "Register" NOT NULL,
    "instructions" TEXT NOT NULL,
    "minWords" INTEGER NOT NULL,
    "maxWords" INTEGER NOT NULL,
    "isNt2" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WritingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT,
    "taskDescription" TEXT,
    "text" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingFeedback" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "grammarScore" INTEGER NOT NULL,
    "vocabularyScore" INTEGER NOT NULL,
    "structureScore" INTEGER NOT NULL,
    "registerScore" INTEGER NOT NULL,
    "coherenceScore" INTEGER NOT NULL,
    "taskScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "improvedVersion" TEXT NOT NULL,
    "usefulVocabulary" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingCorrection" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "category" "ErrorCategory" NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WritingCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMistake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "MistakeSource" NOT NULL,
    "category" "ErrorCategory" NOT NULL,
    "original" TEXT NOT NULL,
    "corrected" TEXT NOT NULL,
    "explanation" TEXT,
    "level" "CefrLevel",
    "sourceRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "program" "Nt2Program" NOT NULL,
    "skill" "Skill" NOT NULL,
    "level" "CefrLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "passPercent" INTEGER NOT NULL DEFAULT 60,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MockExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamPart" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "readingExerciseId" TEXT,
    "listeningExerciseId" TEXT,

    CONSTRAINT "MockExamPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" "Skill" NOT NULL,
    "activity" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "exercises" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("userId","date")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "level" "CefrLevel",
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Redactie',
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "readingMinutes" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "VocabularyWord_normalized_idx" ON "VocabularyWord"("normalized");

-- CreateIndex
CREATE INDEX "VocabularyWord_cefrLevel_idx" ON "VocabularyWord"("cefrLevel");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyWord_normalized_partOfSpeech_key" ON "VocabularyWord"("normalized", "partOfSpeech");

-- CreateIndex
CREATE INDEX "WordExample_wordId_idx" ON "WordExample"("wordId");

-- CreateIndex
CREATE INDEX "WordCollocation_wordId_idx" ON "WordCollocation"("wordId");

-- CreateIndex
CREATE INDEX "WordRelation_wordId_idx" ON "WordRelation"("wordId");

-- CreateIndex
CREATE INDEX "WordTopic_topicId_idx" ON "WordTopic"("topicId");

-- CreateIndex
CREATE INDEX "VocabularyCard_userId_due_idx" ON "VocabularyCard"("userId", "due");

-- CreateIndex
CREATE INDEX "VocabularyCard_userId_state_idx" ON "VocabularyCard"("userId", "state");

-- CreateIndex
CREATE INDEX "VocabularyCard_userId_createdAt_idx" ON "VocabularyCard"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyCard_userId_wordId_key" ON "VocabularyCard"("userId", "wordId");

-- CreateIndex
CREATE INDEX "Review_userId_reviewedAt_idx" ON "Review"("userId", "reviewedAt");

-- CreateIndex
CREATE INDEX "Review_cardId_reviewedAt_idx" ON "Review"("cardId", "reviewedAt");

-- CreateIndex
CREATE INDEX "Question_readingExerciseId_idx" ON "Question"("readingExerciseId");

-- CreateIndex
CREATE INDEX "Question_listeningExerciseId_idx" ON "Question"("listeningExerciseId");

-- CreateIndex
CREATE INDEX "Question_grammarTopicId_idx" ON "Question"("grammarTopicId");

-- CreateIndex
CREATE INDEX "Question_mockExamPartId_idx" ON "Question"("mockExamPartId");

-- CreateIndex
CREATE INDEX "AnswerOption_questionId_idx" ON "AnswerOption"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_kind_completedAt_idx" ON "Attempt"("userId", "kind", "completedAt");

-- CreateIndex
CREATE INDEX "Attempt_userId_mockExamId_idx" ON "Attempt"("userId", "mockExamId");

-- CreateIndex
CREATE INDEX "QuestionResponse_attemptId_idx" ON "QuestionResponse"("attemptId");

-- CreateIndex
CREATE INDEX "QuestionResponse_questionId_idx" ON "QuestionResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingExercise_slug_key" ON "ReadingExercise"("slug");

-- CreateIndex
CREATE INDEX "ReadingExercise_level_published_idx" ON "ReadingExercise"("level", "published");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningExercise_slug_key" ON "ListeningExercise"("slug");

-- CreateIndex
CREATE INDEX "ListeningExercise_level_published_idx" ON "ListeningExercise"("level", "published");

-- CreateIndex
CREATE INDEX "TranscriptSegment_exerciseId_order_idx" ON "TranscriptSegment"("exerciseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_slug_key" ON "Podcast"("slug");

-- CreateIndex
CREATE INDEX "PodcastEpisode_podcastId_idx" ON "PodcastEpisode"("podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaRecommendation_slug_key" ON "MediaRecommendation"("slug");

-- CreateIndex
CREATE INDEX "WatchProvider_mediaId_idx" ON "WatchProvider"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "GrammarTopic_slug_key" ON "GrammarTopic"("slug");

-- CreateIndex
CREATE INDEX "GrammarTopic_area_level_idx" ON "GrammarTopic"("area", "level");

-- CreateIndex
CREATE INDEX "GrammarExample_topicId_idx" ON "GrammarExample"("topicId");

-- CreateIndex
CREATE INDEX "GrammarCommonMistake_topicId_idx" ON "GrammarCommonMistake"("topicId");

-- CreateIndex
CREATE INDEX "Conversation_userId_startedAt_idx" ON "Conversation"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakingFeedback_conversationId_key" ON "SpeakingFeedback"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "WritingPrompt_slug_key" ON "WritingPrompt"("slug");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_createdAt_idx" ON "WritingSubmission"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WritingFeedback_submissionId_key" ON "WritingFeedback"("submissionId");

-- CreateIndex
CREATE INDEX "WritingCorrection_submissionId_idx" ON "WritingCorrection"("submissionId");

-- CreateIndex
CREATE INDEX "UserMistake_userId_category_createdAt_idx" ON "UserMistake"("userId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "UserMistake_userId_createdAt_idx" ON "UserMistake"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MockExam_slug_key" ON "MockExam"("slug");

-- CreateIndex
CREATE INDEX "MockExamPart_examId_order_idx" ON "MockExamPart"("examId", "order");

-- CreateIndex
CREATE INDEX "StudySession_userId_createdAt_idx" ON "StudySession"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyWord" ADD CONSTRAINT "VocabularyWord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbForms" ADD CONSTRAINT "VerbForms_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjectiveForms" ADD CONSTRAINT "AdjectiveForms_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCollocation" ADD CONSTRAINT "WordCollocation_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordRelation" ADD CONSTRAINT "WordRelation_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTopic" ADD CONSTRAINT "WordTopic_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTopic" ADD CONSTRAINT "WordTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyCard" ADD CONSTRAINT "VocabularyCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyCard" ADD CONSTRAINT "VocabularyCard_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "VocabularyCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_readingExerciseId_fkey" FOREIGN KEY ("readingExerciseId") REFERENCES "ReadingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_mockExamPartId_fkey" FOREIGN KEY ("mockExamPartId") REFERENCES "MockExamPart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_readingExerciseId_fkey" FOREIGN KEY ("readingExerciseId") REFERENCES "ReadingExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ListeningExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_grammarTopicId_fkey" FOREIGN KEY ("grammarTopicId") REFERENCES "GrammarTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionResponse" ADD CONSTRAINT "QuestionResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingExercise" ADD CONSTRAINT "ReadingExercise_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingWord" ADD CONSTRAINT "ReadingWord_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "ReadingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingWord" ADD CONSTRAINT "ReadingWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningExercise" ADD CONSTRAINT "ListeningExercise_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningWord" ADD CONSTRAINT "ListeningWord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningWord" ADD CONSTRAINT "ListeningWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastEpisode" ADD CONSTRAINT "PodcastEpisode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchProvider" ADD CONSTRAINT "WatchProvider_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarExample" ADD CONSTRAINT "GrammarExample_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "GrammarTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarCommonMistake" ADD CONSTRAINT "GrammarCommonMistake_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "GrammarTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopicWord" ADD CONSTRAINT "GrammarTopicWord_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "GrammarTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarTopicWord" ADD CONSTRAINT "GrammarTopicWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingCorrection" ADD CONSTRAINT "SpeakingCorrection_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ConversationMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingFeedback" ADD CONSTRAINT "SpeakingFeedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "WritingPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingFeedback" ADD CONSTRAINT "WritingFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WritingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingCorrection" ADD CONSTRAINT "WritingCorrection_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "WritingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMistake" ADD CONSTRAINT "UserMistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamPart" ADD CONSTRAINT "MockExamPart_examId_fkey" FOREIGN KEY ("examId") REFERENCES "MockExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamPart" ADD CONSTRAINT "MockExamPart_readingExerciseId_fkey" FOREIGN KEY ("readingExerciseId") REFERENCES "ReadingExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamPart" ADD CONSTRAINT "MockExamPart_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ListeningExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
