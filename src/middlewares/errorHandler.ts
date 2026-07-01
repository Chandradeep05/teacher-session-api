import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req as any).requestId as string | undefined;

  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode,
      ...(requestId && { requestId }),
    });
    return;
  }

  // Mongoose CastError or BSON error — invalid ObjectId
  if (
    err.name === 'CastError' ||
    err.name === 'BSONError' ||
    err.name === 'BSONTypeError' ||
    err.message?.includes('input must be a 24 character hex string') ||
    err.message?.includes('Argument passed in must be a string of 12 bytes')
  ) {
    res.status(400).json({
      success: false,
      message: 'Invalid resource ID format',
      error: 'INVALID_ID',
      ...(requestId && { requestId }),
    });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      ...(requestId && { requestId }),
    });
    return;
  }

  // MongoDB duplicate key error (E11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      error: 'DUPLICATE_KEY',
      ...(requestId && { requestId }),
    });
    return;
  }

  // Unknown / unexpected error — log server-side, return generic message
  console.error(`❌ [${requestId || 'no-id'}] Unexpected error:`, err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_ERROR',
    ...(requestId && { requestId }),
  });
};
