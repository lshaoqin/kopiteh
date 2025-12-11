import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: SocketIOServer;
const userSockets = new Map<number, string[]>(); // userId -> socketIds

export const WebSocketService = {
  init(httpServer: HTTPServer) {
    io = new (require('socket.io').Server)(httpServer, {
      cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
    });

    io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('join_user', (userId: number) => {
        if (!userSockets.has(userId)) userSockets.set(userId, []);
        userSockets.get(userId)!.push(socket.id);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      });

      socket.on('disconnect', () => {
        userSockets.forEach((sockets, userId) => {
          const idx = sockets.indexOf(socket.id);
          if (idx > -1) sockets.splice(idx, 1);
          if (sockets.length === 0) userSockets.delete(userId);
        });
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  notifyOrderStatusChange(userId: number, orderId: number, status: string) {
    if (!io) return;
    io.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
  },

  getIO() {
    return io;
  },
};