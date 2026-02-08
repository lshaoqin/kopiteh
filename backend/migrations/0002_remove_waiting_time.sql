-- Remove waiting_time column from stall table
-- Waiting time will now be calculated dynamically from order_items
ALTER TABLE stall DROP COLUMN IF EXISTS waiting_time;
