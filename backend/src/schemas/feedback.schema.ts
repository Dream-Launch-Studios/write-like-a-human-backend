import { z } from 'zod';

// Enum for feedback status
const feedbackStatusEnum = z.enum(['PENDING', 'ANALYZED', 'REVIEWED']);

// Schema for creating feedback
export const createFeedbackSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    }),
    // body: z.object({
    //     content: z.string().min(1, { message: 'Feedback content is required' }),
    //     status: feedbackStatusEnum.optional().default('PENDING')
    // })
});

// Schema for getting feedback for a document
export const getDocumentFeedbackSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});

// Schema for getting a specific feedback
export const getFeedbackSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid feedback ID' })
    })
});

// Schema for updating feedback
export const updateFeedbackSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid feedback ID' })
    }),
    body: z.object({
        content: z.string().min(1, { message: 'Feedback content is required' }).optional(),
        status: feedbackStatusEnum.optional(),
        response: z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })
});

// Schema for deleting feedback
export const deleteFeedbackSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid feedback ID' })
    })
});

// Schema for getting feedback metrics
export const getFeedbackMetricsSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid feedback ID' })
    })
});

// Schema for generating feedback metrics
export const generateFeedbackMetricsSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid feedback ID' })
    })
});