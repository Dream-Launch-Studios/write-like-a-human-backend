"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedbackMetricsSchema = exports.getFeedbackMetricsSchema = exports.deleteFeedbackSchema = exports.updateFeedbackSchema = exports.getFeedbackSchema = exports.getDocumentFeedbackSchema = exports.createFeedbackSchema = void 0;
const zod_1 = require("zod");
// Enum for feedback status
const feedbackStatusEnum = zod_1.z.enum(['PENDING', 'ANALYZED', 'REVIEWED']);
// Schema for creating feedback
exports.createFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    }),
    // body: z.object({
    //     content: z.string().min(1, { message: 'Feedback content is required' }),
    //     status: feedbackStatusEnum.optional().default('PENDING')
    // })
});
// Schema for getting feedback for a document
exports.getDocumentFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
// Schema for getting a specific feedback
exports.getFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid feedback ID' })
    })
});
// Schema for updating feedback
exports.updateFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid feedback ID' })
    }),
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, { message: 'Feedback content is required' }).optional(),
        status: feedbackStatusEnum.optional(),
        response: zod_1.z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })
});
// Schema for deleting feedback
exports.deleteFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid feedback ID' })
    })
});
// Schema for getting feedback metrics
exports.getFeedbackMetricsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid feedback ID' })
    })
});
// Schema for generating feedback metrics
exports.generateFeedbackMetricsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid feedback ID' })
    })
});
