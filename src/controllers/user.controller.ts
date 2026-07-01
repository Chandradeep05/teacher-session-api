import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as userService from '../services/user.service';
import * as sessionService from '../services/session.service';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const getUserSessions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const history = await sessionService.getUserSessionHistory(id);

  res.status(200).json({
    success: true,
    data: history,
  });
});
