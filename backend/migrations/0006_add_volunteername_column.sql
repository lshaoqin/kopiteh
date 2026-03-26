-- Add is_active column and remove qr_code column from table
BEGIN;

-- Add volunteer_name column to order
ALTER TABLE "order" ADD COLUMN volunteer_name VARCHAR NOT NULL DEFAULT 'Unknown Volunteer';

-- Add volunteer_name column to custom_order_item
ALTER TABLE custom_order_item ADD COLUMN volunteer_name VARCHAR NOT NULL DEFAULT 'Unknown Volunteer';


COMMIT;
