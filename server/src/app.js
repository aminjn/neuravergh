import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import dataRoutes from './routes/data.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import voipRoutes from './routes/voip.js';
import logsRoutes from './routes/logs.js';
import { auditMiddleware } from './audit.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  app.use(auditMiddleware);

  app.use('/api/auth', authRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/voip', voipRoutes);
  app.use('/api/logs', logsRoutes);

  // 404 برای مسیرهای API
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  // مدیریت خطای کلی
  app.use((err, _req, res, _next) => {
    console.error('API error:', err);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}
