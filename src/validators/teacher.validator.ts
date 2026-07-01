import { z } from 'zod';

export const createTeacherSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  specialization: z.string().min(1, 'Specialization is required').trim(),
  experience: z
    .number({ invalid_type_error: 'Experience must be a number' })
    .int('Experience must be a whole number')
    .min(0, 'Experience cannot be negative'),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
