import { z } from 'zod';

// User roles enum
const userRoleEnum = z.enum(['STUDENT', 'TEACHER', 'ADMIN']);

// Schema for listing users
export const listUsersSchema = z.object({
  query: z.object({
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
  })
});

// Schema for getting a user by ID
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid user ID format' })
  })
});

// Schema for updating a user's role
export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid user ID format' })
  }),
  body: z.object({
    role: userRoleEnum
  })
});

// Comprehensive user schema (for reference)
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
  role: userRoleEnum,
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});


// Schema for creating a user
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
    role: userRoleEnum.optional().default('STUDENT'),
    isEmailVerified: z.boolean().optional().default(false)
  })
});

// Schema for updating a user
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid user ID format' })
  }),
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
    isEmailVerified: z.boolean().optional()
  })
});