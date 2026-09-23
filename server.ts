import http from 'http';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import createApp from './backend/src/app.js';
import connectDB from './backend/src/config/db.js';
import User from './backend/src/models/User.js';
import { seedDatabase } from './backend/src/seed/seedData.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  try {
    // 1. Connect to Database (MongoDB or In-Memory fallback)
    await connectDB();

    // 2. Auto-seed if database is freshly started and empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Startup] Empty database detected. Seeding initial demo data...');
      try {
        await seedDatabase();
      } catch (seedErr) {
        console.error('[Startup] Auto-seeding error:', seedErr);
      }
    }

    // 3. Initialize Express Application
    const app = createApp();
    const httpServer = http.createServer(app);

    // 4. Initialize Socket.IO for real-time notifications
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    // Make io accessible in controllers via req.app.get('io')
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Join event-specific room for live updates
      socket.on('join_event', (eventId: string) => {
        if (eventId) {
          socket.join(`event_${eventId}`);
          console.log(`[Socket.IO] Client ${socket.id} joined event room: event_${eventId}`);
        }
      });

      // Leave event room
      socket.on('leave_event', (eventId: string) => {
        if (eventId) {
          socket.leave(`event_${eventId}`);
        }
      });

      // Live check-in broadcast
      socket.on('attendee_checked_in', (data) => {
        io.to(`event_${data.eventId}`).emit('checkin_update', data);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    // 5. Mount Vite Middleware for development OR static serving for production
    if (!isProduction) {
      console.log('[Server] Mounting Vite development middleware...');
      const vite = await createViteServer({
        root: path.join(process.cwd(), 'frontend'),
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('[Server] Serving production build from frontend/dist/...');
      const distPath = path.join(process.cwd(), 'frontend', 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // 6. Listen on Port 3000
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 EVENTFORGE Server running on http://0.0.0.0:${PORT}`);
      console.log(`📡 WebSocket ready on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  }
}

startServer();
