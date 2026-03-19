-- Add allow_remarks column to stall
BEGIN;

ALTER TABLE stall ADD COLUMN allow_remarks BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;