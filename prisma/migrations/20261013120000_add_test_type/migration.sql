-- Test type for the student/public test filters. Additive: existing code
-- ignores the column, so this can be applied before the new code deploys.
ALTER TABLE "Test" ADD COLUMN "testType" TEXT NOT NULL DEFAULT 'FULL_LENGTH';

-- Backfill from what the existing tests are.
UPDATE "Test" SET "testType" = 'SECTIONAL'
WHERE "id" IN (
  SELECT "testId" FROM "Section" GROUP BY "testId" HAVING COUNT(*) = 1
);
UPDATE "Test" SET "testType" = 'DIAGNOSTIC'
WHERE LOWER("title") LIKE '%diagnostic%';
