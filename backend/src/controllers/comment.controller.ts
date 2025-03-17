import { Request, Response } from 'express';
import {
    createComment,
    getDocumentComments,
    getCommentById,
    updateComment,
    deleteComment
} from '../services/comment.service';
import { ApiResponse } from '../types/response';

/**
 * Create a new comment for a document
 */
export const createDocumentComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;
        const { content, feedbackId } = req.body;
        const userId = req.user.id;

        const comment = await createComment({
            content,
            userId,
            documentId,
            feedbackId,
        });

        const response: ApiResponse = {
            success: true,
            message: 'Comment added successfully',
            comment,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating comment:', error);

        // Handle specific error cases
        if (error instanceof Error && error.message.includes('not found')) {
            const response: ApiResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};
/**
 * Get all comments for a document
 */
export const getDocumentCommentsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;
        const feedbackId = req.query.feedbackId as string | undefined;

        const comments = await getDocumentComments(documentId);

        const response: ApiResponse = {
            success: true,
            comments,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting document comments:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get document comments',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};

/**
 * Update a comment
 */
export const updateCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Check if comment exists and user is authorized
        const existingComment = await getCommentById(id);
        if (!existingComment) {
            const response: ApiResponse = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }

        // Only comment owner or admin can update
        if (existingComment?.userId !== req.user.id && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to update this comment',
            };
            res.status(403).json(response);
        }

        const updatedComment = await updateComment(id, { content });

        const response: ApiResponse = {
            success: true,
            message: 'Comment updated successfully',
            comment: {
                id: updatedComment?.id,
                content: updatedComment?.content,
                updatedAt: updatedComment?.updatedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating comment:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Delete a comment
 */
export const deleteCommentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if comment exists and user is authorized
        const existingComment = await getCommentById(id);
        if (!existingComment) {
            const response: ApiResponse = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }

        // Only comment owner or admin can delete
        if (existingComment?.userId !== req.user.id && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to delete this comment',
            };
            res.status(403).json(response);
        }

        const deleted = await deleteComment(id);

        if (!deleted) {
            const response: ApiResponse = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Comment deleted successfully',
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting comment:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};