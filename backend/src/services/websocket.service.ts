import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'socket.io';

let io: SocketIOServer;
const userSockets = new Map<number, string[]>();
const stallSockets = new Map<number, string[]>();

export const WebSocketService = {
  init(httpServer: HTTPServer) {
    io = new Server(httpServer, {
      cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
    });

    io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // User room for order status updates to customers
      socket.on('join_user', (userId: number) => {
        if (!userSockets.has(userId)) userSockets.set(userId, []);
        userSockets.get(userId)!.push(socket.id);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
      });

      // Stall room for runners to receive order updates
      socket.on('join_stall', (stallId: number) => {
        if (!stallSockets.has(stallId)) stallSockets.set(stallId, []);
        stallSockets.get(stallId)!.push(socket.id);
        socket.join(`stall_${stallId}`);
        console.log(`Socket ${socket.id} joined room stall_${stallId}`);
      });

      // Leave stall room
      socket.on('leave_stall', (stallId: number) => {
        socket.leave(`stall_${stallId}`);
        const sockets = stallSockets.get(stallId);
        if (sockets) {
          const idx = sockets.indexOf(socket.id);
          if (idx > -1) sockets.splice(idx, 1);
          if (sockets.length === 0) stallSockets.delete(stallId);
        }
        console.log(`Socket ${socket.id} left room stall_${stallId}`);
      });

      socket.on('disconnect', () => {
        // Clean up user sockets
        userSockets.forEach((sockets, userId) => {
          const idx = sockets.indexOf(socket.id);
          if (idx > -1) sockets.splice(idx, 1);
          if (sockets.length === 0) userSockets.delete(userId);
        });
        // Clean up stall sockets
        stallSockets.forEach((sockets, stallId) => {
          const idx = sockets.indexOf(socket.id);
          if (idx > -1) sockets.splice(idx, 1);
          if (sockets.length === 0) stallSockets.delete(stallId);
        });
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  notifyOrderStatusChange(userId: number, orderId: number, status: string) {
    try {
      if (!io) {
        console.warn('Socket.IO not initialized');
        return;
      }
      io.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
    } catch (err) {
      console.error('WebSocket emit error:', err);
    }
  },

  // Notify stall room when a new order item is created
  notifyStallOrderItemCreated(stallId: number, orderItem: any) {
    try {
      if (!io) {
        console.warn('Socket.IO not initialized');
        return;
      }
      io.to(`stall_${stallId}`).emit('order_item_created', { orderItem });
      console.log(`Notified stall_${stallId} of new order item:`, orderItem.order_item_id);
    } catch (err) {
      console.error('WebSocket emit error:', err);
    }
  },

  // Notify stall room when an order item is updated
  notifyStallOrderItemUpdated(stallId: number, orderItem: any) {
    try {
      if (!io) {
        console.warn('Socket.IO not initialized');
        return;
      }
      io.to(`stall_${stallId}`).emit('order_item_updated', { orderItem });
      console.log(`Notified stall_${stallId} of updated order item:`, orderItem.order_item_id);
    } catch (err) {
      console.error('WebSocket emit error:', err);
    }
  },

  getIO() {
    return io;
  },
};