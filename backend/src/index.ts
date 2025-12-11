import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketService } from './services/websocket.service';
import routes from './routes/index';
import { errorHandler } from './middleware/error.handler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// middleware
app.use(cors());
app.use(express.json());

// websocket
WebSocketService.init(httpServer);

// routes
app.use('/api', routes);

// error handler
app.use(errorHandler);

// health
app.get('/', (_req, res) => {
  res.send('Express + Postgres backend is running 🚀');
});

// quick db check route (optional)
app.get('/_db_health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// start server
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 3000);
  httpServer.listen(port, () => console.log(`Listening on ${port}`));
}

export default app;
