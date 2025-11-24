import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER ?? process.env.POSTGRES_USER,
  host: process.env.DB_HOST ?? process.env.POSTGRES_HOST,
  database: process.env.DB_NAME ?? process.env.POSTGRES_DB,
  password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD,
  port: parseInt(
    process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? "5432",
    10
  ),
});

async function rollback() {
  console.log("Rolling back all tables...");
  try {
    // Drop all tables in reverse dependency order
    await pool.query(`
      DROP TABLE IF EXISTS menu_item_modifier CASCADE;
      DROP TABLE IF EXISTS menu_item_modifier_section CASCADE;
      DROP TABLE IF EXISTS menu_item CASCADE;
      DROP TABLE IF EXISTS "order" CASCADE;
      DROP TABLE IF EXISTS order_item CASCADE;
      DROP TABLE IF EXISTS order_item_modifiers CASCADE;
      DROP TABLE IF EXISTS stall CASCADE;
      DROP TABLE IF EXISTS venue CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
    `);

    console.log("ALL TABLES DROPPED");
  } catch (err) {
    console.error("Rollback failed:", (err as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rollback().catch((err) => {
  console.error("Rollback error:", err);
  process.exit(1);
});
