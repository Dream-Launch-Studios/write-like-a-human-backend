"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWordSuggestionSchema = exports.getWordSuggestionsSchema = exports.generateWordSuggestionsSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for generating word suggestions for a document
 */
exports.generateWordSuggestionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Document ID is required'),
    }),
});
/**
 * Schema for getting word suggestions for a document
 */
exports.getWordSuggestionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Document ID is required'),
    }),
    query: zod_1.z.object({
        isAccepted: zod_1.z.enum(['true', 'false', 'null']).optional(),
        highlighted: zod_1.z.enum(['true', 'false']).optional(),
    }).optional(),
});
/**
 * Schema for accepting or rejecting a word suggestion
 */
exports.updateWordSuggestionSchema = zod_1.z.object({
    body: zod_1.z.object({
        isAccepted: zod_1.z.boolean(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Suggestion ID is required'),
    }),
});
