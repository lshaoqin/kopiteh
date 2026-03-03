import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import routes from './routes';
import errorHandler from './middleware/error.handler';
import { WebSocketService } from './services/websocket.service';
import pool from './config/database';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render
app.get('/health', async (_req, res) => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const latency = Date.now() - start;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      dbLatencyMs: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check DB error:', error);
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
WebSocketService.init(server);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
