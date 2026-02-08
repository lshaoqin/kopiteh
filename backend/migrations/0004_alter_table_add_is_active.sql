-- Add is_active column and remove qr_code column from table
BEGIN;

-- Add is_active column with default true
ALTER TABLE "table" ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Drop qr_code column
ALTER TABLE "table" DROP COLUMN qr_code;

COMMIT;
