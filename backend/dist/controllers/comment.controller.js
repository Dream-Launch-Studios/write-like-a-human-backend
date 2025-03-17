"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommentController = exports.updateCommentController = exports.getDocumentCommentsController = exports.createDocumentComment = void 0;
const comment_service_1 = require("../services/comment.service");
/**
 * Create a new comment for a document
 */
const createDocumentComment = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const { content, feedbackId } = req.body;
        const userId = req.user.id;
        const comment = await (0, comment_service_1.createComment)({
            content,
            userId,
            documentId,
            feedbackId,
        });
        const response = {
            success: true,
            message: 'Comment added successfully',
            comment,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        // Handle specific error cases
        if (error instanceof Error && error.message.includes('not found')) {
            const response = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }
        const response = {
            success: false,
            message: 'Failed to create comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.createDocumentComment = createDocumentComment;
/**
 * Get all comments for a document
 */
const getDocumentCommentsController = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const feedbackId = req.query.feedbackId;
        const comments = await (0, comment_service_1.getDocumentComments)(documentId);
        const response = {
            success: true,
            comments,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting document comments:', error);
        const response = {
            success: false,
            message: 'Failed to get document comments',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getDocumentCommentsController = getDocumentCommentsController;
/**
 * Update a comment
 */
const updateCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        // Check if comment exists and user is authorized
        const existingComment = await (0, comment_service_1.getCommentById)(id);
        if (!existingComment) {
            const response = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }
        // Only comment owner or admin can update
        if ((existingComment === null || existingComment === void 0 ? void 0 : existingComment.userId) !== req.user.id && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to update this comment',
            };
            res.status(403).json(response);
        }
        const updatedComment = await (0, comment_service_1.updateComment)(id, { content });
        const response = {
            success: true,
            message: 'Comment updated successfully',
            comment: {
                id: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.id,
                content: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.content,
                updatedAt: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating comment:', error);
        const response = {
            success: false,
            message: 'Failed to update comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.updateCommentController = updateCommentController;
/**
 * Delete a comment
 */
const deleteCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if comment exists and user is authorized
        const existingComment = await (0, comment_service_1.getCommentById)(id);
        if (!existingComment) {
            const response = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }
        // Only comment owner or admin can delete
        if ((existingComment === null || existingComment === void 0 ? void 0 : existingComment.userId) !== req.user.id && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to delete this comment',
            };
            res.status(403).json(response);
        }
        const deleted = await (0, comment_service_1.deleteComment)(id);
        if (!deleted) {
            const response = {
                success: false,
                message: 'Comment not found',
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Comment deleted successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        const response = {
            success: false,
            message: 'Failed to delete comment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.deleteCommentController = deleteCommentController;
