import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function rollback() {
  console.log('Rolling back all tables...');
  try {
    // Drop all tables in reverse dependency order
    await pool.query(`
      DROP TABLE IF EXISTS menu_item_modifier CASCADE;
      DROP TABLE IF EXISTS menu_item_modifier_section CASCADE;
      DROP TABLE IF EXISTS menu_item CASCADE;
      DROP TABLE IF EXISTS stall CASCADE;
      DROP TABLE IF EXISTS venue CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
    `);
    console.log('ALL TABLES DROPPED');
  } catch (err) {
    console.error('Rollback failed:', (err as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollback().catch((err) => {
  console.error('Rollback error:', err);
  process.exit(1);
});