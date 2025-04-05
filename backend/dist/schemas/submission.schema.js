"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubmissionFeedbackSchema = exports.evaluateSubmissionSchema = exports.finalSubmitAssignmentSchema = exports.resubmitAssignmentSchema = exports.updateSubmissionStatusSchema = exports.submissionParamsSchema = exports.userSubmissionByAssignmentIdParamsSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for submission params
 */
exports.userSubmissionByAssignmentIdParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Submission ID is required'),
    }),
});
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
exports.finalSubmitAssignmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Submission ID is required" }).cuid(),
    }),
    body: zod_1.z.object({
        documentId: zod_1.z.string({ required_error: "Document ID is required" }).cuid(),
    })
});
exports.evaluateSubmissionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Submission ID is required" }).cuid(),
    }),
    body: zod_1.z.object({
        feedback: zod_1.z.string().optional(),
        grade: zod_1.z.string().optional(),
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
