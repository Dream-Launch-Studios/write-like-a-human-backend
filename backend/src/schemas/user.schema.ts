import { z } from 'zod';

// User roles enum
const userRoleEnum = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);

// Schema for listing users
export const listUsersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, { 
      message: 'Limit must be between 1 and 100' 
    }),
  role: userRoleEnum.optional()
});

// Schema for getting a user by ID
export const getUserByIdSchema = z.object({
  id: z.string().uuid({ message: 'Invalid user ID format' })
});

// Schema for updating a user's role
export const updateUserRoleSchema = z.object({
  id: z.string().uuid({ message: 'Invalid user ID format' }),
  role: userRoleEnum
});