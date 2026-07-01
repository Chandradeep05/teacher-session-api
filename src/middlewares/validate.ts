import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodType<any>;
  params?: ZodType<any>;
  query?: ZodType<any>;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
};
