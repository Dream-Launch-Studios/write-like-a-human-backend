import { z } from 'zod';
/**
 * Schema for generating word suggestions for a document
 */
export declare const generateWordSuggestionsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
/**
 * Schema for getting word suggestions for a document
 */
export declare const getWordSuggestionsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodOptional<z.ZodObject<{
        isAccepted: z.ZodOptional<z.ZodEnum<["true", "false", "null"]>>;
        highlighted: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    }, "strip", z.ZodTypeAny, {
        highlighted?: "true" | "false" | undefined;
        isAccepted?: "null" | "true" | "false" | undefined;
    }, {
        highlighted?: "true" | "false" | undefined;
        isAccepted?: "null" | "true" | "false" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    query?: {
        highlighted?: "true" | "false" | undefined;
        isAccepted?: "null" | "true" | "false" | undefined;
    } | undefined;
}, {
    params: {
        id: string;
    };
    query?: {
        highlighted?: "true" | "false" | undefined;
        isAccepted?: "null" | "true" | "false" | undefined;
    } | undefined;
}>;
/**
 * Schema for accepting or rejecting a word suggestion
 */
export declare const updateWordSuggestionSchema: z.ZodObject<{
    body: z.ZodObject<{
        isAccepted: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isAccepted: boolean;
    }, {
        isAccepted: boolean;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        isAccepted: boolean;
    };
    params: {
        id: string;
    };
}, {
    body: {
        isAccepted: boolean;
    };
    params: {
        id: string;
    };
}>;
