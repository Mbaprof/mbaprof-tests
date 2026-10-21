-- Step 2 of 2 for "recordings can have several parts per day".
-- Apply this ONLY after the code that uses ("batchId","classDate","part") is
-- deployed: the previous version of the site still upserts recordings by
-- ("batchId","classDate") and would fail without this index.
DROP INDEX "Lecture_batchId_classDate_key";
