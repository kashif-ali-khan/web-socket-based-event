import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (userId, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('ws://localhost:8080');
    socketRef.current.on('connect', () => {
      socketRef.current.emit('register', userId);
    });
    socketRef.current.on('message', (data) => {
      onMessage(data);
    });
    return () => socketRef.current.disconnect();
  }, [userId]);

  const sendMessage = (type, to, payload = {}) => {
    socketRef.current.emit('message', { type, from: userId, to, payload });
  };

  return sendMessage;
};