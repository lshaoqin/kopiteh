import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

const pool = new Pool({ user: process.env.DB_USER ?? process.env.POSTGRES_USER,
  host: process.env.DB_HOST ?? process.env.POSTGRES_HOST,
  database: process.env.DB_NAME ?? process.env.POSTGRES_DB,
  password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? '5432', 10), });

async function run() {
  const client = await pool.connect();
  try {
    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    for (const file of files) {
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`Applying: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✓ ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`${file} failed: ${(err as Error).message}`);
      }
    }

    console.log('All migrations applied.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Migration error:', err.message || err);
  process.exit(1);
});