import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { createTeacherSchema } from '../validators/teacher.validator';
import * as teacherController from '../controllers/teacher.controller';

const router = Router();

// POST /api/teachers — Create teacher (helper endpoint)
router.post('/', validate({ body: createTeacherSchema }), teacherController.createTeacher);

export default router;
