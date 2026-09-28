const { Server } = require('socket.io');
const { corsOrigin } = require('../config');

/**
 * Presence is tracked per username so several tabs of the same user
 * count as one online user.
 */
function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: { origin: corsOrigin } });
  const online = new Map(); // username -> Set<socketId>

  const onlineUsers = () => [...online.keys()].sort();
  const broadcastPresence = () => io.emit('presence:update', onlineUsers());

  io.on('connection', (socket) => {
    socket.on('user:join', (username, ack) => {
      const name = typeof username === 'string' ? username.trim().slice(0, 30) : '';
      if (!name) return ack?.({ ok: false, error: 'username is required' });

      socket.data.username = name;
      if (!online.has(name)) online.set(name, new Set());
      online.get(name).add(socket.id);

      ack?.({ ok: true, users: onlineUsers() });
      broadcastPresence();
    });

    socket.on('typing', (isTyping) => {
      if (!socket.data.username) return;
      socket.broadcast.emit('typing', { username: socket.data.username, isTyping: !!isTyping });
    });

    socket.on('disconnect', () => {
      const name = socket.data.username;
      if (!name) return;
      const sockets = online.get(name);
      sockets?.delete(socket.id);
      if (sockets && sockets.size === 0) {
        online.delete(name);
        socket.broadcast.emit('typing', { username: name, isTyping: false });
      }
      broadcastPresence();
    });

    socket.on('error', (err) => console.error('Socket error:', err.message));
  });

  return io;
}

module.exports = initSockets;
