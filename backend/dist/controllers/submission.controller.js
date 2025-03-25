"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubmissionFeedbackController = exports.getSubmissionFeedbackController = exports.resubmitAssignmentController = exports.getUserSubmissionsController = exports.deleteSubmissionController = exports.updateSubmissionStatusController = exports.getSubmissionByIdController = void 0;
const submission_service_1 = require("../services/submission.service");
/**
 * Get a submission by ID
 */
const getSubmissionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const submission = await (0, submission_service_1.getSubmissionById)(id);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to view this submission
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isSubmitter && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: 'Unauthorized to view this submission',
            };
            res.status(403).json(response);
        }
        const response = {
            success: true,
            submission,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting submission:', error);
        const response = {
            success: false,
            message: 'Failed to get submission',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getSubmissionByIdController = getSubmissionByIdController;
/**
 * Update submission status
 */
const updateSubmissionStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        // Check if submission exists
        const submission = await (0, submission_service_1.getSubmissionById)(id);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Determine authorization
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        // Authorization rules based on status change
        if ((status === 'SUBMITTED' && !isSubmitter) ||
            ((status === 'GRADED' || status === 'RETURNED') && !isTeacherOrAdmin)) {
            const response = {
                success: false,
                message: 'Unauthorized to update this submission status',
            };
            res.status(403).json(response);
        }
        const updatedSubmission = await (0, submission_service_1.updateSubmissionStatus)(id, status);
        const response = {
            success: true,
            message: 'Submission status updated successfully',
            submission: {
                id: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.id,
                status: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.status,
                updatedAt: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating submission status:', error);
        const response = {
            success: false,
            message: 'Failed to update submission status',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.updateSubmissionStatusController = updateSubmissionStatusController;
/**
 * Delete a submission
 */
const deleteSubmissionController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if submission exists
        const submission = await (0, submission_service_1.getSubmissionById)(id);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to delete this submission
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isSubmitter && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: 'Unauthorized to delete this submission',
            };
            res.status(403).json(response);
        }
        const deleted = await (0, submission_service_1.deleteSubmission)(id);
        if (!deleted) {
            const response = {
                success: false,
                message: 'Failed to delete submission',
            };
            res.status(500).json(response);
        }
        const response = {
            success: true,
            message: 'Submission deleted successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting submission:', error);
        const response = {
            success: false,
            message: 'Failed to delete submission',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.deleteSubmissionController = deleteSubmissionController;
/**
 * Get submissions for the current user
 */
const getUserSubmissionsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const submissions = await (0, submission_service_1.getUserSubmissions)(userId);
        const response = {
            success: true,
            submissions,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting user submissions:', error);
        const response = {
            success: false,
            message: 'Failed to get user submissions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getUserSubmissionsController = getUserSubmissionsController;
/**
 * Resubmit an assignment
 */
const resubmitAssignmentController = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id: submissionId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;
        // Check if submission exists
        const submission = await (0, submission_service_1.getSubmissionById)(submissionId);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to resubmit
        if ((submission === null || submission === void 0 ? void 0 : submission.userId) !== userId) {
            const response = {
                success: false,
                message: 'Unauthorized to resubmit this assignment',
            };
            res.status(403).json(response);
        }
        // Check if file was uploaded
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded',
            };
            res.status(400).json(response);
        }
        const updatedSubmission = await (0, submission_service_1.resubmitAssignment)({
            submissionId,
            userId,
            documentId: submission === null || submission === void 0 ? void 0 : submission.documentId,
        }, (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.buffer, (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.originalname, (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.mimetype, title);
        const response = {
            success: true,
            message: 'Assignment resubmitted successfully',
            submission: updatedSubmission,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error resubmitting assignment:', error);
        const response = {
            success: false,
            message: 'Failed to resubmit assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.resubmitAssignmentController = resubmitAssignmentController;
/**
 * Get feedback for a submission
 */
const getSubmissionFeedbackController = async (req, res) => {
    try {
        const { id: submissionId } = req.params;
        const userId = req.user.id;
        // Check if submission exists
        const submission = await (0, submission_service_1.getSubmissionById)(submissionId);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to view feedback
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isSubmitter && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: 'Unauthorized to view feedback for this submission',
            };
            res.status(403).json(response);
        }
        const feedback = await (0, submission_service_1.getSubmissionFeedback)(submissionId);
        const response = {
            success: true,
            feedback,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting submission feedback:', error);
        const response = {
            success: false,
            message: 'Failed to get submission feedback',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getSubmissionFeedbackController = getSubmissionFeedbackController;
/**
 * Add feedback to a submission
 */
const addSubmissionFeedbackController = async (req, res) => {
    try {
        const { id: submissionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        // Check if submission exists
        const submission = await (0, submission_service_1.getSubmissionById)(submissionId);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to add feedback
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isTeacherOrAdmin) {
            const response = {
                success: false,
                message: 'Unauthorized to add feedback',
            };
            res.status(403).json(response);
        }
        const feedback = await (0, submission_service_1.addSubmissionFeedback)({
            content,
            userId,
            submissionId,
        });
        const response = {
            success: true,
            message: 'Feedback added successfully',
            feedback,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error adding submission feedback:', error);
        const response = {
            success: false,
            message: 'Failed to add feedback',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.addSubmissionFeedbackController = addSubmissionFeedbackController;
