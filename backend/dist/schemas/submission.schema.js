"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubmissionFeedbackSchema = exports.resubmitAssignmentSchema = exports.updateSubmissionStatusSchema = exports.submissionParamsSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for submission params
 */
exports.submissionParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
/**
 * Schema for updating submission status
 */
exports.updateSubmissionStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
/**
 * Schema for resubmitting an assignment
 */
exports.resubmitAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Document title is required'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
/**
 * Schema for adding submission feedback
 */
exports.addSubmissionFeedbackSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Feedback content is required'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
