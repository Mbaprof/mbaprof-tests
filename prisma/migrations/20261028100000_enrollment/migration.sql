-- Enrollment from the CET 2027 enroll page. Additive: the running site ignores all of this.
ALTER TABLE "Lead" ADD COLUMN "code" TEXT;

CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);
