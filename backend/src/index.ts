import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes';
import errorHandler from './middleware/error.handler';
import { WebSocketService } from './services/websocket.service';

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
WebSocketService.init(server);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket initialized`);
});

export default app;
