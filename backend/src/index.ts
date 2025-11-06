import express, { type Request, type Response } from 'express';
import cors from 'cors';
import venueRoutes from './routes/venue.routes';
import db from './config/database';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// health
app.get('/', (_req: Request, res: Response) => {
  res.send('Express + Postgres backend is running 🚀');
});

// mount api routes
app.use('/api/venues', venueRoutes);

// quick db check route (optional)
app.get('/_db_health', async (_req: Request, res: Response) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
