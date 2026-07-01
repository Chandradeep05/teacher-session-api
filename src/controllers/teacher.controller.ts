import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as teacherService from '../services/teacher.service';

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.createTeacher(req.body);

  res.status(201).json({
    success: true,
    data: teacher,
  });
});
