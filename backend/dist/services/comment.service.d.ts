import { CreateCommentData, UpdateCommentData } from '../types/comment.types';
/**
 * Create a new comment
 */
export declare const createComment: (data: CreateCommentData) => Promise<{
    user: {
        id: string;
        name: string | null;
    };
} & {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    documentId: string;
    feedbackId: string | null;
}>;
/**
 * Get comments for a document
 */
export declare const getDocumentComments: (documentId: string) => Promise<({
    user: {
        id: string;
        name: string | null;
        email: string;
    };
} & {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    documentId: string;
    feedbackId: string | null;
})[]>;
/**
 * Get a comment by ID
 */
export declare const getCommentById: (id: string) => Promise<({
    user: {
        id: string;
        name: string | null;
    };
} & {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    documentId: string;
    feedbackId: string | null;
}) | null>;
/**
 * Update a comment
 */
export declare const updateComment: (id: string, data: UpdateCommentData) => Promise<{
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    documentId: string;
    feedbackId: string | null;
} | null>;
/**
 * Delete a comment
 */
export declare const deleteComment: (id: string) => Promise<boolean>;
