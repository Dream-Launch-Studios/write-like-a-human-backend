import { z } from 'zod';

/**
 * Schema for creating a group
 */
export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Group name is required'),
        description: z.string().optional(),
    }),
});

/**
 * Schema for updating a group
 */
export const updateGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Group name is required').optional(),
        description: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().min(1, 'Group ID is required'),
    }),
});

/**
 * Schema for group params
 */
export const groupParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Group ID is required'),
    }),
});

/**
 * Schema for joining a group with token
 */
export const joinGroupSchema = z.object({
    params: z.object({
        token: z.string().min(1, 'Join token is required'),
    }),
});

/**
 * Schema for adding a member to a group
 */
export const addGroupMemberSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email is required'),
    }),
    params: z.object({
        id: z.string().min(1, 'Group ID is required'),
    }),
});

/**
 * Schema for removing a member from a group
 */
export const removeGroupMemberSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Group ID is required'),
        userId: z.string().min(1, 'User ID is required'),
    }),
});