import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

//dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use SUPABASE_URL connection string if available, otherwise fall back to individual env vars
const pool = process.env.SUPABASE_URL
  ? new Pool({
      connectionString: process.env.SUPABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER ?? process.env.POSTGRES_USER,
      host: process.env.DB_HOST ?? process.env.POSTGRES_HOST,
      database: process.env.DB_NAME ?? process.env.POSTGRES_DB,
      password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? '5432', 10),
    });

export default pool;
