import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createUserSchema, userIdParamSchema } from '../validators/user.validator';
import * as userController from '../controllers/user.controller';

const router = Router();

// POST /api/users — Create user
router.post('/', validate({ body: createUserSchema }), userController.createUser);

// GET /api/users/:id/sessions — User session history (aggregation)
router.get(
  '/:id/sessions',
  validate({ params: userIdParamSchema }),
  userController.getUserSessions
);

export default router;
