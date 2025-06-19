import { useEffect, useRef } from 'react';

export const useWebSocket = (userId, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080');
    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: 'register', from: userId }));
    };
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    return () => socketRef.current.close();
  }, [userId]);

  const sendMessage = (type, to, payload = {}) => {
    socketRef.current.send(JSON.stringify({ type, from: userId, to, payload }));
  };

  return sendMessage;
};