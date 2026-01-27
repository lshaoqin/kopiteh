'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinStall: (stallId: number) => void;
  leaveStall: (stallId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  joinStall: () => {},
  leaveStall: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Create socket connection regardless of user authentication for runner pages
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL_ROOT || 'http://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);
      // Only join user room if authenticated
      if (user?.user_id) {
        newSocket.emit('join_user', user.user_id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.user_id]);

  const joinStall = useCallback((stallId: number) => {
    if (socket && isConnected) {
      socket.emit('join_stall', stallId);
      console.log(`Joining stall room: stall_${stallId}`);
    }
  }, [socket, isConnected]);

  const leaveStall = useCallback((stallId: number) => {
    if (socket && isConnected) {
      socket.emit('leave_stall', stallId);
      console.log(`Leaving stall room: stall_${stallId}`);
    }
  }, [socket, isConnected]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, joinStall, leaveStall }}>
      {children}
    </WebSocketContext.Provider>
  );
};