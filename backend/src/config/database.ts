import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Use DATABASE_URL (Render standard) or SUPABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      user: process.env.DB_USER ?? process.env.POSTGRES_USER,
      host: process.env.DB_HOST ?? process.env.POSTGRES_HOST,
      database: process.env.DB_NAME ?? process.env.POSTGRES_DB,
      password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? '5432', 10),
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err.message));

export default pool;
