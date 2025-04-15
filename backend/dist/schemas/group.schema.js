"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeGroupMemberSchema = exports.addGroupMemberSchema = exports.joinGroupSchema = exports.groupParamsSchema = exports.updateGroupSchema = exports.createGroupSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for creating a group
 */
exports.createGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Group name is required'),
        description: zod_1.z.string().optional(),
    }),
});
/**
 * Schema for updating a group
 */
exports.updateGroupSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Group name is required').optional(),
        description: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Group ID is required'),
    }),
});
/**
 * Schema for group params
 */
exports.groupParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Group ID is required'),
    }),
});
/**
 * Schema for joining a group with token
 */
exports.joinGroupSchema = zod_1.z.object({
    params: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Join token is required'),
    }),
});
/**
 * Schema for adding a member to a group
 */
exports.addGroupMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Valid email is required'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Group ID is required'),
    }),
});
/**
 * Schema for removing a member from a group
 */
exports.removeGroupMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Group ID is required'),
        userId: zod_1.z.string().min(1, 'User ID is required'),
    }),
});
