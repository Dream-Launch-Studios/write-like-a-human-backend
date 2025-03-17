import { z } from 'zod';

/**
 * Schema for creating a comment on a document
 */
export const createDocumentCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Comment content is required'),
        feedbackId: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().min(1, 'Document ID is required'),
    }),
});

/**
 * Schema for updating an existing comment
 */
export const updateCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Comment content is required'),
    }),
    params: z.object({
        id: z.string().min(1, 'Comment ID is required'),
    }),
});

/**
 * Schema for deleting a comment
 */
export const deleteCommentSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Comment ID is required'),
    }),
});

/**
 * Schema for getting comments for a document
 */
export const getDocumentCommentsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Document ID is required'),
    }),
    query: z.object({
        feedbackId: z.string().optional(),
    }).optional(),
});