import { Request, Response } from 'express';
import {
    getSubmissionById,
    updateSubmissionStatus,
    deleteSubmission,
    getUserSubmissionsByAssignmentId,
    resubmitAssignment,
    getSubmissionFeedback,
    addSubmissionFeedback,
    finalSubmitAssignment,
    evaluateSubmission
} from '../services/submission.service';
import { ApiResponse } from '../types/submission.types';

/**
 * Get a submission by ID
 */
export const getSubmissionByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const submission = await getSubmissionById(id);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to view this submission
        const isSubmitter = submission?.userId === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

        if (!isSubmitter && !isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to view this submission',
            };
            res.status(403).json(response);
        }

        const response: ApiResponse = {
            success: true,
            submission,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting submission:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get submission',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Update submission status
 */
export const updateSubmissionStatusController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(id);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Determine authorization
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        const isSubmitter = submission?.userId === userId;

        // Authorization rules based on status change
        if (
            (status === 'SUBMITTED' && !isSubmitter) ||
            ((status === 'GRADED' || status === 'RETURNED') && !isTeacherOrAdmin)
        ) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to update this submission status',
            };
            res.status(403).json(response);
        }

        const updatedSubmission = await updateSubmissionStatus(id, status);

        const response: ApiResponse = {
            success: true,
            message: 'Submission status updated successfully',
            submission: {
                id: updatedSubmission?.id,
                status: updatedSubmission?.status,
                updatedAt: updatedSubmission?.updatedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating submission status:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update submission status',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Delete a submission
 */
export const deleteSubmissionController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(id);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to delete this submission
        const isSubmitter = submission?.userId === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

        if (!isSubmitter && !isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to delete this submission',
            };
            res.status(403).json(response);
        }

        const deleted = await deleteSubmission(id);

        if (!deleted) {
            const response: ApiResponse = {
                success: false,
                message: 'Failed to delete submission',
            };
            res.status(500).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Submission deleted successfully',
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting submission:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete submission',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

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
export const getUserSubmissionsByAssignmentIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { id } = req.params

        const submissions = await getUserSubmissionsByAssignmentId(userId, id);

        const response: ApiResponse = {
            success: true,
            submissions,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting user submissions:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get user submissions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};




/**
 * Resubmit an assignment
 */
export const resubmitAssignmentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: submissionId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(submissionId);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to resubmit
        if (submission?.userId !== userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to resubmit this assignment',
            };
            res.status(403).json(response);
        }

        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded',
            };
            res.status(400).json(response);
        }

        const updatedSubmission = await resubmitAssignment(
            {
                submissionId,
                userId,
                documentId: submission?.documentId!,
            },
            req?.file?.buffer!,
            req?.file?.originalname!,
            req?.file?.mimetype!,
            title,
        );

        const response: ApiResponse = {
            success: true,
            message: 'Assignment resubmitted successfully',
            submission: updatedSubmission,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error resubmitting assignment:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to resubmit assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Get feedback for a submission
 */
export const getSubmissionFeedbackController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: submissionId } = req.params;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(submissionId);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to view feedback
        const isSubmitter = submission?.userId === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

        if (!isSubmitter && !isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to view feedback for this submission',
            };
            res.status(403).json(response);
        }

        const feedback = await getSubmissionFeedback(submissionId);

        const response: ApiResponse = {
            success: true,
            feedback,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting submission feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get submission feedback',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Add feedback to a submission
 */
export const addSubmissionFeedbackController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: submissionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(submissionId);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to add feedback
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

        if (!isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to add feedback',
            };
            res.status(403).json(response);
        }

        const feedback = await addSubmissionFeedback({
            content,
            userId,
            submissionId,
        });

        const response: ApiResponse = {
            success: true,
            message: 'Feedback added successfully',
            feedback,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding submission feedback:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to add feedback',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

export const finalSubmitAssignmentController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: submissionId } = req.params;
        const { documentId } = req.body;
        const userId = req.user.id;

        const result = await finalSubmitAssignment(submissionId, documentId, userId);

        const response: ApiResponse = {
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
    } catch (error) {
        console.error('Error final submitting assignment:', error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('not authorized')) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
        }

        const response: ApiResponse = {
            success: false,
            message: 'Failed to final submit assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};


/**
 * Controller for handling submission evaluation requests
 */
export const evaluateSubmissionController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: submissionResultId } = req.params;
        const teacherId = req.user.id;
        const { feedback, grade } = req.body;

        const evaluationData = {
            feedback,
            grade,
        };


        const result = await evaluateSubmission(submissionResultId, teacherId, evaluationData);

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
    } catch (error) {
        console.error('Error evaluating submission:', error);

        // Handle specific errors with appropriate status codes
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
                return;
            } else if (error.message.includes('not authorized')) {
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