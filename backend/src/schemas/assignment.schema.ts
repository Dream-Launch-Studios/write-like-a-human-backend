import { z } from 'zod';

/**
 * Schema for creating an assignment
 */
export const createAssignmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Assignment title is required'),
        description: z.string().min(1, 'Assignment description is required'),
        dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
        createdWith: z.enum(['PASTE', 'UPLOAD']).default("UPLOAD").optional(),
        contentFormat: z.enum(['HTML', 'TEXT']).default("HTML"),
        pastedContent: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().cuid(),
    }),
});

/**
 * Schema for updating an assignment
*/
export const updateAssignmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Assignment title is required').optional(),
        description: z.string().min(1, 'Assignment description is required').optional(),
        dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
        documentUrl: z.string().url().optional().nullable(),
        documentName: z.string().optional().nullable(),
        documentType: z.string().optional().nullable(),
    }),
    params: z.object({
        id: z.string().min(1, 'Assignment ID is required'),
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
 * Schema for assignment params
 */
export const assignmentParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Assignment ID is required'),
    }),
});

/**
 * Schema for submitting an assignment
 */
export const submitAssignmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Document title is required'),
    }),
    params: z.object({
        id: z.string().min(1, 'Assignment ID is required'),
    }),
});

/**
 * Schema for updating submission status
 */
export const updateSubmissionStatusSchema = z.object({
    body: z.object({
        status: z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']),
    }),
    params: z.object({
        id: z.string().min(1, 'Submission ID is required'),
    }),
});