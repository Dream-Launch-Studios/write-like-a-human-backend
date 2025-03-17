import { Comment } from '@prisma/client';

/**
 * Interface for creating a comment
 */
export interface CreateCommentData {
    content: string;
    userId: string;
    documentId: string;
    feedbackId?: string | null;
}

/**
 * Interface for updating a comment
 */
export interface UpdateCommentData {
    content: string;
}

/**
 * Interface for comment with user data
 */
export interface CommentWithUser extends Comment {
    user: {
        id: string;
        name: string | null;
    };
}