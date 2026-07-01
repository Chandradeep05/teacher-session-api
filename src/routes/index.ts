import { Router } from 'express';
import userRoutes from './user.routes';
import teacherRoutes from './teacher.routes';
import sessionRoutes from './session.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/teachers', teacherRoutes);
router.use('/sessions', sessionRoutes);

export default router;
