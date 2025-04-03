"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVersionsSchema = exports.createVersionSchema = exports.deleteDocumentSchema = exports.updateDocumentSchema = exports.getDocumentSchema = exports.listDocumentsSchema = exports.createDocumentSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a document
exports.createDocumentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        pastedContent: zod_1.z.string().optional(),
        groupId: zod_1.z.string().uuid({ message: 'Invalid group ID' }).optional(),
        createdWith: zod_1.z.enum(['PASTE', 'UPLOAD']).default("UPLOAD").optional(),
        contentFormat: zod_1.z.enum(['HTML', 'TEXT']).default("HTML").optional(),
    })
});
// Schema for listing documents with pagination
exports.listDocumentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .refine((val) => val > 0 && val <= 100, {
            message: 'Limit must be between 1 and 100'
        }),
        groupId: zod_1.z.string().uuid({ message: 'Invalid group ID' }).optional(),
        search: zod_1.z.string().optional()
    })
});
// Schema for getting a document
exports.getDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
// Schema for updating a document
exports.updateDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid document ID' })
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, { message: 'Title cannot be empty' }).optional(),
        content: zod_1.z.string().optional()
    }).refine(data => data.title || data.content, {
        message: 'At least one field (title or content) must be provided'
    })
});
// Schema for deleting a document
exports.deleteDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid document ID' })
    })
});
// Schema for creating a new version of a document
exports.createVersionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        content: zod_1.z.string()
    })
    // Note: file validation is handled by uploadMiddleware
});
// Schema for listing document versions
exports.listVersionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
