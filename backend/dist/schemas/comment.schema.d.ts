import { z } from 'zod';
/**
 * Schema for creating a comment on a document
 */
export declare const createDocumentCommentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
        feedbackId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        feedbackId?: string | null | undefined;
    }, {
        content: string;
        feedbackId?: string | null | undefined;
    }>;
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
    body: {
        content: string;
        feedbackId?: string | null | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        content: string;
        feedbackId?: string | null | undefined;
    };
}>;
/**
 * Schema for updating an existing comment
 */
export declare const updateCommentSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
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
    body: {
        content: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        content: string;
    };
}>;
/**
 * Schema for deleting a comment
*/
export declare const deleteCommentSchema: z.ZodObject<{
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
 * Schema for getting comments for a document
 */
export declare const getDocumentCommentsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodOptional<z.ZodObject<{
        feedbackId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        feedbackId?: string | undefined;
    }, {
        feedbackId?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    query?: {
        feedbackId?: string | undefined;
    } | undefined;
}, {
    params: {
        id: string;
    };
    query?: {
        feedbackId?: string | undefined;
    } | undefined;
}>;
