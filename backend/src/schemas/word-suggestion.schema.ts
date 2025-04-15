import { z } from 'zod';

/**
 * Schema for generating word suggestions for a document
 */
export const generateWordSuggestionsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Document ID is required'),
    }),
});

/**
 * Schema for getting word suggestions for a document
 */
export const getWordSuggestionsSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Document ID is required'),
    }),
    query: z.object({
        isAccepted: z.enum(['true', 'false', 'null']).optional(),
        highlighted: z.enum(['true', 'false']).optional(),
    }).optional(),
});

/**
 * Schema for accepting or rejecting a word suggestion
 */
export const updateWordSuggestionSchema = z.object({
    body: z.object({
        isAccepted: z.boolean(),
    }),
    params: z.object({
        id: z.string().min(1, 'Suggestion ID is required'),
    }),
});