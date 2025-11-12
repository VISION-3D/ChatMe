require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Routes & middleware
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const chatRoomRoutes = require('./routes/chatRooms');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
initializeSocket(io);
// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log('════════════════════════════════════════');
  console.log(` ${new Date().toISOString()}`);
  console.log(` ${req.method} ${req.url}`);
  console.log(` Headers:`, {
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    authorization: req.headers.authorization ? 'Present' : 'Missing'
  });
  console.log(` Body:`, req.body);
  console.log('════════════════════════════════════════');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatme', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(' MongoDB Connection Reussie !');
})
.catch((error) => {
  console.error(' MongoDB Connection Error:', error.message);
});

// Simple routes
app.get('/', (req, res) => {
  res.json({
    message: ' ChatMe Serveur en marche !',
    phase: 'Phase 1 - Configuration',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/test'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenue sur ChatMe API',
    version: '1.0.0',
    status: 'Operational',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    data: {
      test: 'successful',
      randomId: Math.random().toString(36).substr(2, 9)
    }
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    message: 'POST request received',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// API route registrations
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);
app.use('/api/chatrooms', chatRoomRoutes);

// 404 for API and non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      availableEndpoints: [
        'GET /api',
        'GET /api/health', 
        'GET /api/test',
        'POST /api/test'
      ]
    });
  }
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    suggestion: 'Use API endpoints under /api'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(' Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server (single listener)
httpServer.listen(PORT, () => {
  console.log(`
 ChatMe Le Server a démarré !
 Port: ${PORT}
 Environment: ${process.env.NODE_ENV || 'development'}
 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/chatme'}
 Time: ${new Date().toLocaleString()}

 Available URLs:
   ➡️ http://localhost:${PORT}
   ➡️ http://localhost:${PORT}/api
   ➡️ http://localhost:${PORT}/api/health
   ➡️ http://localhost:${PORT}/api/test

 Logging activé - Prêt à recevoir des requêtes !
  `);
});