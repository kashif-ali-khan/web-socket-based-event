const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { CommunicationIdentityClient } = require('@azure/communication-identity');

// --- Get your connection string from Azure portal
const connectionString = process.env.ACS_CONNECTION_STRING || '';
const identityClient = new CommunicationIdentityClient(connectionString);

const app = express();
app.use(cors());
const server = http.createServer(app);

// Simple in-memory store for recording data
const recordingData = {};

// The PUBLIC_URL will be the public-facing URL for this server.
// For local development, you can use a tool like ngrok to expose your localhost.
// For example: `ngrok http 8080`. Then set PUBLIC_URL to the ngrok URL (e.g., "https://<id>.ngrok.io")
const PUBLIC_URL = process.env.PUBLIC_URL;

app.get('/token', async (req, res) => {
    try {
        const user = await identityClient.createUser();
        const { token } = await identityClient.getToken(user, ["voip"]);
        res.json({ userId: user.communicationUserId, token });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error creating token');
    }
});

const io = new Server(server, {
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

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});