"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.userSchema = exports.updateUserRoleSchema = exports.getUserByIdSchema = exports.listUsersSchema = void 0;
const zod_1 = require("zod");
// User roles enum
const userRoleEnum = zod_1.z.enum(['STUDENT', 'TEACHER', 'ADMIN']);
// Schema for listing users
exports.listUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
        limit: zod_1.z
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
exports.getUserByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid user ID format' })
    })
});
// Schema for updating a user's role
exports.updateUserRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid user ID format' })
    }),
    body: zod_1.z.object({
        role: userRoleEnum
    })
});
// Comprehensive user schema (for reference)
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional().nullable(),
    role: userRoleEnum,
    isEmailVerified: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Schema for creating a user
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: 'Invalid email address' }),
        name: zod_1.z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
        role: userRoleEnum.optional().default('STUDENT'),
        isEmailVerified: zod_1.z.boolean().optional().default(false)
    })
});
// Schema for updating a user
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid user ID format' })
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
        isEmailVerified: zod_1.z.boolean().optional()
    })
});
