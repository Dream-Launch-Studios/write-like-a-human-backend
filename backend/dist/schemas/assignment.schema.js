"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubmissionStatusSchema = exports.submitAssignmentSchema = exports.assignmentParamsSchema = exports.groupParamsSchema = exports.updateAssignmentSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for creating an assignment
 */
exports.createAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Assignment title is required'),
        description: zod_1.z.string().min(1, 'Assignment description is required'),
        dueDate: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
        createdWith: zod_1.z.enum(['PASTE', 'UPLOAD']).default("UPLOAD").optional(),
        contentFormat: zod_1.z.enum(['HTML', 'TEXT']).default("HTML"),
        pastedContent: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().cuid(),
    }),
});
/**
 * Schema for updating an assignment
*/
exports.updateAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Assignment title is required').optional(),
        description: zod_1.z.string().min(1, 'Assignment description is required').optional(),
        dueDate: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
        documentUrl: zod_1.z.string().url().optional().nullable(),
        documentName: zod_1.z.string().optional().nullable(),
        documentType: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Assignment ID is required'),
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
 * Schema for assignment params
 */
exports.assignmentParamsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid(),
    }),
});
/**
 * Schema for submitting an assignment
 */
exports.submitAssignmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Document title is required'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Assignment ID is required'),
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
