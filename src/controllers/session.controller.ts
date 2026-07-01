import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as sessionService from '../services/session.service';

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sessionService.createSession(req.body);

  res.status(201).json({
    success: true,
    data: session,
  });
});

export const getAvailableSessions = asyncHandler(async (req: Request, res: Response) => {
  const dateTimestamp = Number(req.query.dateTimestamp as string);
  const sessions = await sessionService.getAvailableSessions(dateTimestamp);

  res.status(200).json({
    success: true,
    data: sessions,
  });
});

export const bookSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { userId } = req.body;
  const session = await sessionService.bookSession(id, userId);

  res.status(200).json({
    success: true,
    data: session,
  });
});

export const completeSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const session = await sessionService.completeSession(id);

  res.status(200).json({
    success: true,
    data: session,
  });
});
