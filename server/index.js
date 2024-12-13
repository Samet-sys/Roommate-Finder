import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import listingRoutes from './routes/listings.js';
import messageRoutes from './routes/messages.js';

import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Yardımcı Fonksiyon: Oda İsmi Oluşturma
function getRoomName(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort();
  return `room_${sortedIds[0]}_${sortedIds[1]}`;
}

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Belirli bir odaya katılma
  socket.on('joinRoom', ({ otherUserId }) => {
    const roomName = getRoomName(socket.userId, otherUserId);
    socket.join(roomName);
    console.log(`User ${socket.userId} joined room: ${roomName}`);
  });

  // Yeni mesaj gönderme
  socket.on('sendMessage', async (messageData) => {
    try {
      // messageData örneği: { receiver, listing, content }
      const message = new Message({
        sender: socket.userId,
        receiver: messageData.receiver,
        listing: messageData.listing,
        content: messageData.content
      });

      const savedMessage = await message.save();
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('sender', 'name avatar occupation')
        .populate('receiver', 'name avatar occupation');

      // Oda ismi oluşturma
      const roomName = getRoomName(socket.userId, messageData.receiver);
      io.to(roomName).emit('newMessage', populatedMessage);

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Serve static files from the dist folder
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Redirect all non-API routes to React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
