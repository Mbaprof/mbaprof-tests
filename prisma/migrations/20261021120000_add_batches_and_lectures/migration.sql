-- AlterTable
ALTER TABLE "User" ADD COLUMN     "batchId" TEXT;

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetExam" TEXT NOT NULL,
    "zoomJoinUrl" TEXT NOT NULL,
    "zoomPasscode" TEXT,
    "days" INTEGER[],
    "startTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "classDate" DATE NOT NULL,
    "topic" TEXT,
    "recordingUrl" TEXT,
    "recordingPasscode" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassOverride" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "classDate" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "startTime" TEXT,
    "durationMinutes" INTEGER,
    "note" TEXT,

    CONSTRAINT "ClassOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureJoin" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classDate" DATE NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LectureJoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_targetExam_idx" ON "Batch"("targetExam");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_batchId_classDate_key" ON "Lecture"("batchId", "classDate");

-- CreateIndex
CREATE UNIQUE INDEX "ClassOverride_batchId_classDate_key" ON "ClassOverride"("batchId", "classDate");

-- CreateIndex
CREATE INDEX "LectureJoin_batchId_classDate_idx" ON "LectureJoin"("batchId", "classDate");

-- CreateIndex
CREATE UNIQUE INDEX "LectureJoin_userId_batchId_classDate_key" ON "LectureJoin"("userId", "batchId", "classDate");

-- CreateIndex
CREATE INDEX "User_batchId_idx" ON "User"("batchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassOverride" ADD CONSTRAINT "ClassOverride_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureJoin" ADD CONSTRAINT "LectureJoin_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureJoin" ADD CONSTRAINT "LectureJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

