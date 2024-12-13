// src/contexts/SocketContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    const newSocket = io('http://localhost:3000', {
      auth: {
        token,
      },
      transports: ['websocket'], // Opsiyonel: Sadece WebSocket kullan
    });

    setSocket(newSocket);

    // Bağlantı durumunu dinle
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from Socket.IO server');
    });

    newSocket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
