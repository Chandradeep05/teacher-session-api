import { Router } from 'express';
import { validate } from '../middlewares/validate';
import {
  createSessionSchema,
  availableSessionsQuerySchema,
  sessionIdParamSchema,
  bookSessionSchema,
} from '../validators/session.validator';
import * as sessionController from '../controllers/session.controller';

const router = Router();

// POST /api/sessions — Create session
router.post('/', validate({ body: createSessionSchema }), sessionController.createSession);

// GET /api/sessions/available?dateTimestamp={ts} — Available sessions (aggregation)
router.get(
  '/available',
  validate({ query: availableSessionsQuerySchema }),
  sessionController.getAvailableSessions
);

// POST /api/sessions/:id/book — Book a session
router.post(
  '/:id/book',
  validate({ params: sessionIdParamSchema, body: bookSessionSchema }),
  sessionController.bookSession
);

// PATCH /api/sessions/:id/complete — Mark session complete
router.patch(
  '/:id/complete',
  validate({ params: sessionIdParamSchema }),
  sessionController.completeSession
);

export default router;
