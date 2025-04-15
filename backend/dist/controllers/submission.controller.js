"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateSubmissionController = exports.finalSubmitAssignmentController = exports.addSubmissionFeedbackController = exports.getSubmissionFeedbackController = exports.resubmitAssignmentController = exports.getUserSubmissionsByAssignmentIdController = exports.deleteSubmissionController = exports.updateSubmissionStatusController = exports.getSubmissionByIdController = void 0;
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
// export const getUserSubmissionsController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId = req.user.id;
//         const submissions = await getUserSubmissions(userId);
//         const response: ApiResponse = {
//             success: true,
//             submissions,
//         };
//         res.status(200).json(response);
//     } catch (error) {
//         console.error('Error getting user submissions:', error);
//         const response: ApiResponse = {
//             success: false,
//             message: 'Failed to get user submissions',
//             error: error instanceof Error ? error.message : 'Unknown error',
//         };
//         res.status(500).json(response);
//     }
// };
/**
 * Get submissions by assignment Id for the current user
 */
const getUserSubmissionsByAssignmentIdController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const submissions = await (0, submission_service_1.getUserSubmissionsByAssignmentId)(userId, id);
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
exports.getUserSubmissionsByAssignmentIdController = getUserSubmissionsByAssignmentIdController;
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
const finalSubmitAssignmentController = async (req, res) => {
    try {
        const { id: submissionId } = req.params;
        const { documentId } = req.body;
        const userId = req.user.id;
        const result = await (0, submission_service_1.finalSubmitAssignment)(submissionId, documentId, userId);
        const response = {
            success: true,
            message: 'Assignment final submitted successfully',
            data: {
                submissionId: result.submission.id,
                status: result.submission.status,
                submittedAt: result.submission.submittedAt,
                evaluationStatus: result.submissionResult.status
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error final submitting assignment:', error);
        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            else if (error.message.includes('not authorized')) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
        }
        const response = {
            success: false,
            message: 'Failed to final submit assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.finalSubmitAssignmentController = finalSubmitAssignmentController;
/**
 * Controller for handling submission evaluation requests
 */
const evaluateSubmissionController = async (req, res) => {
    try {
        const { id: submissionResultId } = req.params;
        const teacherId = req.user.id;
        const { feedback, grade } = req.body;
        const evaluationData = {
            feedback,
            grade,
        };
        const result = await (0, submission_service_1.evaluateSubmission)(submissionResultId, teacherId, evaluationData);
        const response = {
            success: true,
            message: `Submission evaluated successfully`,
            data: {
                id: result.id,
                feedback: result.feedback,
                grade: result.grade,
                status: result.status,
                updatedAt: result.updatedAt
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error evaluating submission:', error);
        // Handle specific errors with appropriate status codes
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            else if (error.message.includes('not authorized')) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
                return;
            }
        }
        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate submission',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.evaluateSubmissionController = evaluateSubmissionController;
