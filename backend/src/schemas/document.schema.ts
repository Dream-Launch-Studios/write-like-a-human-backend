import { z } from 'zod';

// Schema for creating a document
export const createDocumentSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        groupId: z.string().uuid({ message: 'Invalid group ID' }).optional()
    })
    // Note: file validation is handled by uploadMiddleware
});

// Schema for listing documents with pagination
export const listDocumentsSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => val > 0, { message: 'Page must be greater than 0' }),
        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .refine((val) => val > 0 && val <= 100, {
                message: 'Limit must be between 1 and 100'
            }),
        groupId: z.string().uuid({ message: 'Invalid group ID' }).optional()
    })
});

// Schema for getting a document
export const getDocumentSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});

// Schema for updating a document
export const updateDocumentSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid document ID' })
    }),
    body: z.object({
        title: z.string().min(1, { message: 'Title cannot be empty' }).optional(),
        content: z.string().optional()
    }).refine(data => data.title || data.content, {
        message: 'At least one field (title or content) must be provided'
    })
});

// Schema for deleting a document
export const deleteDocumentSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid document ID' })
    })
});

// Schema for creating a new version of a document
export const createVersionSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    }),
    body: z.object({
        title: z.string().optional(),
        content: z.string()
    })
    // Note: file validation is handled by uploadMiddleware
});

// Schema for listing document versions
export const listVersionsSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});