import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = (req as any).requestId as string | undefined;

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: 'ROUTE_NOT_FOUND',
    ...(requestId && { requestId }),
  });
};
