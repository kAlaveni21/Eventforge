import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import speakerRoutes from './routes/speakerRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import sponsorRoutes from './routes/sponsorRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import { errorHandler } from './middleware/errorMiddleware.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline scripts and assets for Vite & Tailwind
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Body Parsing Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Logging Middleware (concise in dev)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Static Uploads Folder
  const uploadsDir = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Healthcheck endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'EventForge Enterprise API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/speakers', speakerRoutes);
  app.use('/api/venues', venueRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/registrations', registrationRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/sponsors', sponsorRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/upload', uploadRoutes);

  // Seed trigger endpoint for easy demo convenience
  app.post('/api/seed-now', async (req: Request, res: Response) => {
    try {
      const { seedDatabase } = await import('./seed/seedData.js');
      await seedDatabase();
      res.json({ success: true, message: 'Database reseeded successfully with full demo data!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Reseeding failed', error: err.message });
    }
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
