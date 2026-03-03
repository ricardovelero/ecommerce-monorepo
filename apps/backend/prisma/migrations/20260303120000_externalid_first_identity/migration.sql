-- Backfill externalId for legacy rows before making it required.
UPDATE "User"
SET "externalId" = CONCAT('legacy-', "id")
WHERE "externalId" IS NULL;

-- Email is now an optional profile attribute and no longer unique.
DROP INDEX IF EXISTS "User_email_key";

-- externalId is now required identity key.
ALTER TABLE "User"
ALTER COLUMN "externalId" SET NOT NULL;
