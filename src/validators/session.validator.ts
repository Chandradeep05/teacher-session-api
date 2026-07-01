import { z } from 'zod';

export const createSessionSchema = z
  .object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
    startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 date' }),
    endTime: z.string().datetime({ message: 'endTime must be a valid ISO 8601 date' }),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const availableSessionsQuerySchema = z.object({
  dateTimestamp: z.string().min(1, 'dateTimestamp is required').refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'dateTimestamp must be a valid positive number (Unix timestamp in ms)' }
  ),
});

export const sessionIdParamSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
});

export const bookSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type BookSessionInput = z.infer<typeof bookSessionSchema>;
