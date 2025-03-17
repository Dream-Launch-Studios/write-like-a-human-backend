import { Request, Response } from 'express';
import * as documentService from '../services/document.service';
import * as feedbackService from '../services/feedback.service';
import { ApiResponse } from '../types/response';

/**
 * Create feedback for a document
 */
export const createFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;
        const { content, status = 'PENDING' } = req.body;

        // Get document from service
        const document = await documentService.getDocumentById(documentId);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Create feedback
        const feedback = await feedbackService.createFeedback({
            content,
            status,
            userId: req.user.id,
            documentId,
            groupId: document.groupId
        });

        const response: ApiResponse = {
            success: true,
            message: 'Feedback created successfully',
            feedback: {
                id: feedback.id,
                content: feedback.content,
                status: feedback.status,
                userId: feedback.userId,
                documentId: feedback.documentId,
                createdAt: feedback.createdAt
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get all feedback for a document
 */
export const getDocumentFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(documentId);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get feedback for document
        const feedback = await feedbackService.getDocumentFeedback(documentId);

        const response: ApiResponse = {
            success: true,
            feedback
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting document feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get document feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get a specific feedback by ID
 */
export const getFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get feedback from service
        const feedback = await feedbackService.getFeedbackById(id);

        if (!feedback) {
            const response: ApiResponse = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this feedback
        if (feedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // If feedback user isn't current user and user isn't admin, check group access
            if (feedback.groupId) {
                const isMember = await documentService.isUserInGroup(req.user.id, feedback.groupId);
                if (!isMember) {
                    const response: ApiResponse = {
                        success: false,
                        message: 'You do not have access to this feedback'
                    };
                    res.status(403).json(response);
                    return;
                }
            } else {
                // Not group feedback and not owner or admin
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this feedback'
                };
                res.status(403).json(response);
                return;
            }
        }

        const response: ApiResponse = {
            success: true,
            feedback
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Update feedback
 */
export const updateFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content, status, response: feedbackResponse } = req.body;

        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);

        if (!existingFeedback) {
            const response: ApiResponse = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check permissions for updating feedback
        if (existingFeedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // Non-owners and non-admins can't update feedback
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to update this feedback'
            };
            res.status(403).json(response);
            return;
        }

        // Update feedback
        const updatedFeedback = await feedbackService.updateFeedback(id, {
            content,
            status,
            response: feedbackResponse
        })

        const response: ApiResponse = {
            success: true,
            message: 'Feedback updated successfully',
            feedback: {
                id: updatedFeedback?.id,
                content: updatedFeedback?.content,
                status: updatedFeedback?.status,
                response: updatedFeedback?.response,
                updatedAt: updatedFeedback?.updatedAt
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);

        if (!existingFeedback) {
            const response: ApiResponse = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check permissions for deleting feedback
        if (existingFeedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // Non-owners and non-admins can't delete feedback
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to delete this feedback'
            };
            res.status(403).json(response);
            return;
        }

        // Delete feedback
        await feedbackService.deleteFeedback(id);

        const response: ApiResponse = {
            success: true,
            message: 'Feedback deleted successfully'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get feedback metrics
 */
export const getFeedbackMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);

        if (!existingFeedback) {
            const response: ApiResponse = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check permissions for accessing feedback
        if (existingFeedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // If feedback user isn't current user and user isn't admin, check group access
            if (existingFeedback.groupId) {
                const isMember = await documentService.isUserInGroup(req.user.id, existingFeedback.groupId);
                if (!isMember) {
                    const response: ApiResponse = {
                        success: false,
                        message: 'You do not have access to this feedback'
                    };
                    res.status(403).json(response);
                    return;
                }
            } else {
                // Not group feedback and not owner or admin
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this feedback'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get metrics
        const metrics = await feedbackService.getFeedbackMetrics(id);

        if (!metrics) {
            const response: ApiResponse = {
                success: false,
                message: 'No metrics found for this feedback'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            metrics
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting feedback metrics:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get feedback metrics',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};