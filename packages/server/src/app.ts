import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import flagsRoutes from './routes/flags';
import tasksRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import collaborationRoutes from './routes/collaboration';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — only allow the configured client origin
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // Health check (used by CI/CD pipelines after deploy)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV ?? 'unknown' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/flags', flagsRoutes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/collaboration', collaborationRoutes);

  // Centralised error handler (must be last)
  app.use(errorHandler);

  return app;
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  await mongoose.connect(uri);
  console.log('[db] Connected to MongoDB');
}
