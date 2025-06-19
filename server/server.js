const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    const { type, to, from, payload } = data;

    if (type === 'register') {
      clients[from] = ws;
      console.log(`Registered: ${from}`);
      return;
    }

    if (clients[to]) {
      clients[to].send(JSON.stringify({ type, from, payload }));
    }
  });

  ws.on('close', () => {
    for (const user in clients) {
      if (clients[user] === ws) {
        delete clients[user];
        break;
      }
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');