/**
 * SocketContext.tsx
 * Uses useState for the socket so consumers re-render when it becomes available.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useE2E } from './E2EContext';

import { SOCKET_URL } from '../config';

const SERVER_URL = SOCKET_URL;

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  userId: string;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  userId: '',
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getMyPublicKey, registerPeerKey } = useE2E();

  useEffect(() => {
    if (!userId) return;

    console.log('[socket] creating connection for', userId);

    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', async () => {
      setIsConnected(true);
      newSocket.emit('register', { userId });
      console.log('[socket] connected & registered as', userId);

      // ── Broadcast our public key to everyone online ──────────────────────
      const myPublicKey = await getMyPublicKey();
      if (myPublicKey) {
        newSocket.emit('sharePublicKey', { userId, publicKey: myPublicKey });
        console.log('[E2E] Public key broadcast sent');
      }
    });

    // ── Receive public key from a peer → derive shared secret ────────────
    newSocket.on('peerPublicKey', async ({ fromUserId, publicKey }: { fromUserId: string; publicKey: string }) => {
      console.log('[E2E] Received public key from', fromUserId);
      const isNewKey = await registerPeerKey(fromUserId, publicKey);

      // Only send our own key back if this was a NEW key to prevent infinite loops
      if (isNewKey) {
        const myPublicKey = await getMyPublicKey();
        if (myPublicKey) {
          newSocket.emit('sharePublicKey', { userId, publicKey: myPublicKey });
        }
      }
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[socket] disconnected:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('[socket] cleaning up for', userId);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, userId }}>
      {children}
    </SocketContext.Provider>
  );
}
