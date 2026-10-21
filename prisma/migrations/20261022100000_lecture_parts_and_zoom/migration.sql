-- Recordings can now come from Zoom automatically and a day can have several parts.
-- Step 1 (additive). The old unique index on ("batchId","classDate") is dropped
-- in a later migration, after the new code is live, so nothing breaks in between.
ALTER TABLE "Lecture" ADD COLUMN "zoomUuid" TEXT;
ALTER TABLE "Lecture" ADD COLUMN "part" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Lecture" ADD COLUMN "durationMinutes" INTEGER;

CREATE UNIQUE INDEX "Lecture_zoomUuid_key" ON "Lecture"("zoomUuid");
CREATE UNIQUE INDEX "Lecture_batchId_classDate_part_key" ON "Lecture"("batchId", "classDate", "part");
