/**
 * Custom server with Socket.IO for real-time chat.
 * In production, use `node server.js` instead of `next start`.
 * The standard `npm start` (next start) works too but without WebSocket.
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory message store for Socket.IO
const chatMessages = [
  {
    _id: "msg_001",
    userId: "user_001",
    username: "admin",
    text: "Welcome to the Task Board chat!",
    channel: "general",
    createdAt: new Date("2024-03-01").toISOString(),
  },
  {
    _id: "msg_002",
    userId: "user_002",
    username: "alice",
    text: "Hey team, the CI pipeline is looking good",
    channel: "general",
    createdAt: new Date("2024-03-02").toISOString(),
  },
  {
    _id: "msg_003",
    userId: "user_003",
    username: "bob",
    text: "Auth implementation is coming along nicely",
    channel: "general",
    createdAt: new Date("2024-03-03").toISOString(),
  },
];

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/v1/ws/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    socket.on("chat:join", ({ channel, username }) => {
      const ch = channel || "general";
      socket.join(ch);
      socket.data.username = username;
      socket.data.channel = ch;

      // Send chat history
      const history = chatMessages.filter((m) => m.channel === ch).slice(-50);
      socket.emit("chat:history", history);

      console.log(`[WS] ${username} joined #${ch}`);
    });

    socket.on("chat:message", ({ text, channel }) => {
      const ch = channel || socket.data.channel || "general";
      const msg = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: socket.id,
        username: socket.data.username || "anonymous",
        text,
        channel: ch,
        createdAt: new Date().toISOString(),
      };

      chatMessages.push(msg);
      // Keep max 500 messages
      if (chatMessages.length > 500) {
        chatMessages.splice(0, chatMessages.length - 500);
      }

      io.to(ch).emit("chat:new-message", msg);
      console.log(`[WS] ${msg.username} in #${ch}: ${text}`);
    });

    socket.on("disconnect", () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> TaskBoard ready on http://${hostname}:${port}`);
    console.log(`> WebSocket ready on ws://${hostname}:${port}/api/v1/ws/socket.io`);
    console.log(`> Mode: ${dev ? "development" : "production"}`);
  });
});
