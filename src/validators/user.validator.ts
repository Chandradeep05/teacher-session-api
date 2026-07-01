import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  phone: z.string().min(1, 'Phone number is required').trim(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
