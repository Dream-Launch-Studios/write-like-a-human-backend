"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentCommentsSchema = exports.deleteCommentSchema = exports.updateCommentSchema = exports.createDocumentCommentSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for creating a comment on a document
 */
exports.createDocumentCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content is required'),
        feedbackId: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Document ID is required'),
    }),
});
/**
 * Schema for updating an existing comment
 */
exports.updateCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content is required'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Comment ID is required'),
    }),
});
/**
 * Schema for deleting a comment
 */
exports.deleteCommentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Comment ID is required'),
    }),
});
/**
 * Schema for getting comments for a document
 */
exports.getDocumentCommentsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Document ID is required'),
    }),
    query: zod_1.z.object({
        feedbackId: zod_1.z.string().optional(),
    }).optional(),
});
