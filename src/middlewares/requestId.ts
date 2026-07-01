import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Attaches a unique request ID to every incoming request.
 * The ID is logged server-side and included in error responses for debugging.
 */
export const requestId = (req: Request, _res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  (req as any).requestId = id;
  next();
};
