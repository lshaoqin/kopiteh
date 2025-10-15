import express, { type Request, type Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// configure PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'db', // service name from docker-compose
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + Postgres backend is running 🚀');
});

app.get('/stalls', async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM stalls');
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
