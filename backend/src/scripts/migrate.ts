import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER ?? process.env.POSTGRES_USER,
      host: process.env.DB_HOST ?? process.env.POSTGRES_HOST,
      database: process.env.DB_NAME ?? process.env.POSTGRES_DB,
      password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? '5432', 10),
    });

async function run() {
  console.log('Starting migrations...');
  console.log('Connection string:', connectionString ? 'Using DATABASE_URL/SUPABASE_URL' : 'Using individual env vars');
  
  const client = await pool.connect();
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    // Get already applied migrations
    const { rows: applied } = await client.query('SELECT name FROM _migrations');
    const appliedNames = new Set(applied.map(r => r.name));

    for (const file of files) {
      if (appliedNames.has(file)) {
        console.log(`Skipping (already applied): ${file}`);
        continue;
      }

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`Applying: ${file}`);
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
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