import { WordSuggestion } from '@prisma/client';

/**
 * Interface for creating a word suggestion
 */
export interface CreateWordSuggestionData {
    originalWord: string;
    suggestedWord: string;
    position: number;
    startOffset: number;
    endOffset: number;
    context?: string | null;
    aiConfidence?: number | null;
    documentId: string;
    userId: string;
}

/**
 * Interface for batch creating word suggestions
 */
export interface BatchCreateWordSuggestionsData {
    documentId: string;
    userId: string;
    suggestions: {
        originalWord: string;
        suggestedWord: string;
        position: number;
        startOffset: number;
        endOffset: number;
        context?: string | null;
        aiConfidence?: number | null;
    }[];
}

/**
 * Interface for updating a word suggestion
 */
export interface UpdateWordSuggestionData {
    isAccepted: boolean;
}

/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    errors?: any;
    error?: string;
    [key: string]: any;
}

/**
 * Interface for AI-generated word suggestions
 */
export interface AISuggestion {
    originalWord: string;
    suggestedWord: string;
    position: number;
    startOffset: number;
    endOffset: number;
    context: string;
    aiConfidence: number;
}