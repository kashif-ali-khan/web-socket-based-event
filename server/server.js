const { Server } = require('socket.io');
const io = new Server(8080, {
  cors: { origin: '*' }
});

let clients = {};

io.on('connection', (socket) => {
  socket.on('register', (from) => {
    clients[from] = socket;
    socket.userId = from;
    console.log(`Registered: ${from}`);
  });

  socket.on('message', (data) => {
    const { type, to, from, payload } = data;
    if (clients[to]) {
      clients[to].emit('message', { type, from, payload });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId && clients[socket.userId]) {
      delete clients[socket.userId];
    }
  });
});

console.log('Socket.IO server running on ws://localhost:8080');