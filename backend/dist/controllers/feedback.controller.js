"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackMetrics = exports.deleteFeedback = exports.updateFeedback = exports.getFeedback = exports.getDocumentFeedback = exports.createFeedback = void 0;
const documentService = __importStar(require("../services/document.service"));
const feedbackService = __importStar(require("../services/feedback.service"));
/**
 * Create feedback for a document
 */
const createFeedback = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        // const { content, status = 'PENDING' } = req.body;
        // Get document from service
        const document = await documentService.getDocumentById(documentId);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
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
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Create feedback
        const feedback = await feedbackService.createFeedback({
            content: "",
            status: "PENDING",
            userId: req.user.id,
            documentId,
            groupId: document.groupId
        });
        const response = {
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
    }
    catch (error) {
        console.error('Error creating feedback:', error);
        const response = {
            success: false,
            message: 'Failed to create feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createFeedback = createFeedback;
/**
 * Get all feedback for a document
 */
const getDocumentFeedback = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        // Get document from service
        const document = await documentService.getDocumentById(documentId);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
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
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Get feedback for document
        const feedback = await feedbackService.getDocumentFeedback(documentId);
        const response = {
            success: true,
            feedback
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting document feedback:', error);
        const response = {
            success: false,
            message: 'Failed to get document feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getDocumentFeedback = getDocumentFeedback;
/**
 * Get a specific feedback by ID
 */
const getFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        // Get feedback from service
        const feedback = await feedbackService.getFeedbackById(id);
        if (!feedback) {
            const response = {
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
                    const response = {
                        success: false,
                        message: 'You do not have access to this feedback'
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            else {
                // Not group feedback and not owner or admin
                const response = {
                    success: false,
                    message: 'You do not have access to this feedback'
                };
                res.status(403).json(response);
                return;
            }
        }
        const response = {
            success: true,
            feedback
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting feedback:', error);
        const response = {
            success: false,
            message: 'Failed to get feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getFeedback = getFeedback;
/**
 * Update feedback
 */
const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, status, response: feedbackResponse } = req.body;
        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);
        if (!existingFeedback) {
            const response = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check permissions for updating feedback
        if (existingFeedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // Non-owners and non-admins can't update feedback
            const response = {
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
        });
        const response = {
            success: true,
            message: 'Feedback updated successfully',
            feedback: {
                id: updatedFeedback === null || updatedFeedback === void 0 ? void 0 : updatedFeedback.id,
                content: updatedFeedback === null || updatedFeedback === void 0 ? void 0 : updatedFeedback.content,
                status: updatedFeedback === null || updatedFeedback === void 0 ? void 0 : updatedFeedback.status,
                response: updatedFeedback === null || updatedFeedback === void 0 ? void 0 : updatedFeedback.response,
                updatedAt: updatedFeedback === null || updatedFeedback === void 0 ? void 0 : updatedFeedback.updatedAt
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating feedback:', error);
        const response = {
            success: false,
            message: 'Failed to update feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateFeedback = updateFeedback;
/**
 * Delete feedback
 */
const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);
        if (!existingFeedback) {
            const response = {
                success: false,
                message: 'Feedback not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check permissions for deleting feedback
        if (existingFeedback.userId !== req.user.id && req.user.role !== 'ADMIN') {
            // Non-owners and non-admins can't delete feedback
            const response = {
                success: false,
                message: 'You are not authorized to delete this feedback'
            };
            res.status(403).json(response);
            return;
        }
        // Delete feedback
        await feedbackService.deleteFeedback(id);
        const response = {
            success: true,
            message: 'Feedback deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        const response = {
            success: false,
            message: 'Failed to delete feedback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.deleteFeedback = deleteFeedback;
/**
 * Get feedback metrics
 */
const getFeedbackMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        // Get existing feedback
        const existingFeedback = await feedbackService.getFeedbackById(id);
        if (!existingFeedback) {
            const response = {
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
                    const response = {
                        success: false,
                        message: 'You do not have access to this feedback'
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            else {
                // Not group feedback and not owner or admin
                const response = {
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
            const response = {
                success: false,
                message: 'No metrics found for this feedback'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            metrics
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting feedback metrics:', error);
        const response = {
            success: false,
            message: 'Failed to get feedback metrics',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getFeedbackMetrics = getFeedbackMetrics;
