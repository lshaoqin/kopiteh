-- Move remarks from order table to order_item table
BEGIN;

-- Add remarks column to order_item table
ALTER TABLE order_item 
ADD COLUMN remarks TEXT;

-- Drop remarks column from order table
ALTER TABLE "order" 
DROP COLUMN remarks;

COMMIT;
