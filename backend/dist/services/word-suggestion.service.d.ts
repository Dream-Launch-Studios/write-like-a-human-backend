import { CreateWordSuggestionData, BatchCreateWordSuggestionsData, UpdateWordSuggestionData, AISuggestion } from '../types/word-suggestion.types';
/**
 * Generate word suggestions using OpenAI
 */
export declare const generateAIWordSuggestions: (documentId: string) => Promise<AISuggestion[]>;
/**
 * Create a single word suggestion
 */
export declare const createWordSuggestion: (data: CreateWordSuggestionData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentId: string;
    context: string | null;
    startOffset: number;
    endOffset: number;
    aiConfidence: number | null;
    originalWord: string;
    suggestedWord: string;
    position: number;
    highlighted: boolean;
    isAccepted: boolean | null;
    acceptedAt: Date | null;
}>;
/**
 * Batch create multiple word suggestions
 */
export declare const batchCreateWordSuggestions: (data: BatchCreateWordSuggestionsData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentId: string;
    context: string | null;
    startOffset: number;
    endOffset: number;
    aiConfidence: number | null;
    originalWord: string;
    suggestedWord: string;
    position: number;
    highlighted: boolean;
    isAccepted: boolean | null;
    acceptedAt: Date | null;
}[]>;
/**
 * Get word suggestions for a document
 */
export declare const getDocumentWordSuggestions: (documentId: string, filters?: {
    isAccepted?: boolean | null;
    highlighted?: boolean;
}) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentId: string;
    context: string | null;
    startOffset: number;
    endOffset: number;
    aiConfidence: number | null;
    originalWord: string;
    suggestedWord: string;
    position: number;
    highlighted: boolean;
    isAccepted: boolean | null;
    acceptedAt: Date | null;
}[]>;
/**
 * Get a word suggestion by ID
 */
export declare const getWordSuggestionById: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentId: string;
    context: string | null;
    startOffset: number;
    endOffset: number;
    aiConfidence: number | null;
    originalWord: string;
    suggestedWord: string;
    position: number;
    highlighted: boolean;
    isAccepted: boolean | null;
    acceptedAt: Date | null;
} | null>;
/**
 * Update a word suggestion (accept or reject)
 */
export declare const updateWordSuggestion: (id: string, data: UpdateWordSuggestionData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    documentId: string;
    context: string | null;
    startOffset: number;
    endOffset: number;
    aiConfidence: number | null;
    originalWord: string;
    suggestedWord: string;
    position: number;
    highlighted: boolean;
    isAccepted: boolean | null;
    acceptedAt: Date | null;
} | null>;
/**
 * Delete a word suggestion
 */
export declare const deleteWordSuggestion: (id: string) => Promise<boolean>;
