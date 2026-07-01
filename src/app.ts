import express from 'express';
import cors from 'cors';
import { requestId } from './middlewares/requestId';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// ── Global Middleware ──────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestId);

// ── Routes ─────────────────────────────────────
app.use('/api', routes);

// ── Health Check ───────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ── Error Handling ─────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
