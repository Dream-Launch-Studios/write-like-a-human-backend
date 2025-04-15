import { z } from 'zod';

/**
 * Schema for submission params
 */
export const userSubmissionByAssignmentIdParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Submission ID is required'),
    }),
});

export const submissionParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Submission ID is required'),
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

/**
 * Schema for resubmitting an assignment
 */
export const resubmitAssignmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Document title is required'),
    }),
    params: z.object({
        id: z.string().min(1, 'Submission ID is required'),
    }),
});

export const finalSubmitAssignmentSchema = z.object({
    params: z.object({
        id: z.string({ required_error: "Submission ID is required" }).cuid(),
    }),
    body: z.object({
        documentId: z.string({ required_error: "Document ID is required" }).cuid(),
    })
});

export const evaluateSubmissionSchema = z.object({
    params: z.object({
        id: z.string({ required_error: "Submission ID is required" }).cuid(),
    }),
    body: z.object({
        feedback: z.string().optional(),
        grade: z.string().optional(),
    }),
});

/**
 * Schema for adding submission feedback
 */
export const addSubmissionFeedbackSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Feedback content is required'),
    }),
    params: z.object({
        id: z.string().min(1, 'Submission ID is required'),
    }),
});