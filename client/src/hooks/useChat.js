import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';
import { fetchHistory, sendMessage } from '../api/chatApi';

const TYPING_TIMEOUT = 1500;

export default function useChat(username) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  const loadHistory = useCallback(async () => {
    try {
      const history = await fetchHistory();
      // Merge so nothing received over the socket meanwhile gets lost
      setMessages((prev) => {
        const map = new Map([...history, ...prev].map((m) => [m.id, m]));
        return [...map.values()].sort((a, b) => a.id - b.id);
      });
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!username) return undefined;

    const socket = io(API_URL, { reconnectionAttempts: Infinity });
    socketRef.current = socket;

    const join = () => {
      socket.emit('user:join', username, (res) => {
        if (res?.ok) setOnlineUsers(res.users);
        else setError(res?.error || 'Could not join the chat');
      });
    };

    socket.on('connect', () => {
      setConnected(true);
      join();
      loadHistory(); // also re-syncs anything missed while offline
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setError('Connection lost. Trying to reconnect…'));
    socket.on('message:new', (msg) =>
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
    );
    socket.on('presence:update', setOnlineUsers);
    socket.on('typing', ({ username: who, isTyping: t }) =>
      setTypingUsers((prev) => (t ? [...new Set([...prev, who])] : prev.filter((u) => u !== who)))
    );

    return () => {
      clearTimeout(typingTimer.current);
      socket.disconnect();
    };
  }, [username, loadHistory]);

  const notifyTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing', true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit('typing', false);
    }, TYPING_TIMEOUT);
  }, []);

  const send = useCallback(
    async (text) => {
      clearTimeout(typingTimer.current);
      if (isTyping.current) {
        isTyping.current = false;
        socketRef.current?.emit('typing', false);
      }
      try {
        const msg = await sendMessage(username, text);
        // Server also broadcasts; dedupe by id handles the echo
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        setError('');
        return true;
      } catch (e) {
        setError(e.message);
        return false;
      }
    },
    [username]
  );

  return { messages, onlineUsers, typingUsers, connected, error, loading, send, notifyTyping };
}
