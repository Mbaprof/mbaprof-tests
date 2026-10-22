-- Personal Zoom links per student. Additive: the running site ignores all of this.
ALTER TABLE "Batch" ADD COLUMN "personalLinks" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "BatchRegistration" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "zoomRegistrantId" TEXT NOT NULL,
    "joinUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchRegistration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BatchRegistration_batchId_idx" ON "BatchRegistration"("batchId");
CREATE UNIQUE INDEX "BatchRegistration_userId_batchId_key" ON "BatchRegistration"("userId", "batchId");

ALTER TABLE "BatchRegistration" ADD CONSTRAINT "BatchRegistration_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BatchRegistration" ADD CONSTRAINT "BatchRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
