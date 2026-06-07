/ ==================== BACKEND (Node.js + Express + MongoDB + Socket.io) ====================

// server.js
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const http = require('http');
const reportRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

mongoose.connect('mongodb://localhost:27017/pavementwatch');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
