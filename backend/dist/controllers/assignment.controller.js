"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubmissionStatusController = exports.getSubmissionByIdController = exports.getAssignmentSubmissionsController = exports.submitAssignmentController = exports.deleteAssignmentController = exports.updateAssignmentController = exports.getAssignmentByIdController = exports.getGroupAssignmentsController = exports.createAssignmentController = void 0;
const assignment_service_1 = require("../services/assignment.service");
/**
 * Create a new assignment for a group
 */
const createAssignmentController = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const { title, description, dueDate, documentUrl, documentName, documentType } = req.body;
        const creatorId = req.user.id;
        // Check if user is a member or admin of the group
        const isMember = await (0, assignment_service_1.isUserInGroup)(creatorId, groupId);
        if (!isMember && req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
            const response = {
                success: false,
                message: 'Unauthorized to create assignments for this group',
            };
            res.status(403).json(response);
        }
        const assignment = await (0, assignment_service_1.createAssignment)({
            title,
            description,
            dueDate,
            documentUrl,
            documentName,
            documentType,
            creatorId,
            groupId,
        });
        const response = {
            success: true,
            message: 'Assignment created successfully',
            assignment,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating assignment:', error);
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
            message: 'Failed to create assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.createAssignmentController = createAssignmentController;
/**
 * Get assignments for a group
 */
const getGroupAssignmentsController = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user.id;
        // Check if user is a member or admin of the group
        const isMember = await (0, assignment_service_1.isUserInGroup)(userId, groupId);
        if (!isMember && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to view assignments for this group',
            };
            res.status(403).json(response);
        }
        const assignments = await (0, assignment_service_1.getGroupAssignments)(groupId);
        const response = {
            success: true,
            assignments,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting group assignments:', error);
        const response = {
            success: false,
            message: 'Failed to get group assignments',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getGroupAssignmentsController = getGroupAssignmentsController;
/**
 * Get an assignment by ID
 */
const getAssignmentByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const assignment = await (0, assignment_service_1.getAssignmentById)(id);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Assignment not found',
            };
            res.status(404).json(response);
        }
        // Check if user is a member or admin of the group
        const isMember = await (0, assignment_service_1.isUserInGroup)(userId, assignment === null || assignment === void 0 ? void 0 : assignment.groupId);
        if (!isMember && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to view this assignment',
            };
            res.status(403).json(response);
        }
        const response = {
            success: true,
            assignment,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting assignment:', error);
        const response = {
            success: false,
            message: 'Failed to get assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getAssignmentByIdController = getAssignmentByIdController;
/**
 * Update an assignment
 */
const updateAssignmentController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, documentUrl, documentName, documentType } = req.body;
        const userId = req.user.id;
        // Check if assignment exists
        const assignment = await (0, assignment_service_1.getAssignmentById)(id);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Assignment not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the creator or an admin
        if ((assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to update this assignment',
            };
            res.status(403).json(response);
        }
        const updatedAssignment = await (0, assignment_service_1.updateAssignment)(id, {
            title,
            description,
            dueDate,
            documentUrl,
            documentName,
            documentType,
        });
        const response = {
            success: true,
            message: 'Assignment updated successfully',
            assignment: {
                id: updatedAssignment === null || updatedAssignment === void 0 ? void 0 : updatedAssignment.id,
                title: updatedAssignment === null || updatedAssignment === void 0 ? void 0 : updatedAssignment.title,
                description: updatedAssignment === null || updatedAssignment === void 0 ? void 0 : updatedAssignment.description,
                dueDate: updatedAssignment === null || updatedAssignment === void 0 ? void 0 : updatedAssignment.dueDate,
                updatedAt: updatedAssignment === null || updatedAssignment === void 0 ? void 0 : updatedAssignment.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating assignment:', error);
        const response = {
            success: false,
            message: 'Failed to update assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.updateAssignmentController = updateAssignmentController;
/**
 * Delete an assignment
 */
const deleteAssignmentController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if assignment exists
        const assignment = await (0, assignment_service_1.getAssignmentById)(id);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Assignment not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the creator or an admin
        if ((assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to delete this assignment',
            };
            res.status(403).json(response);
        }
        const deleted = await (0, assignment_service_1.deleteAssignment)(id);
        if (!deleted) {
            const response = {
                success: false,
                message: 'Assignment not found',
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Assignment deleted successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting assignment:', error);
        const response = {
            success: false,
            message: 'Failed to delete assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.deleteAssignmentController = deleteAssignmentController;
/**
 * Submit an assignment
 */
const submitAssignmentController = async (req, res) => {
    var _a;
    try {
        const { id: assignmentId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;
        // This would typically come from a file upload process
        // For this example, we'll assume the document has already been created
        // and the ID is passed in the request
        const documentId = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) || "";
        if (!documentId) {
            const response = {
                success: false,
                message: 'No document provided',
            };
            res.status(400).json(response);
        }
        const submission = await (0, assignment_service_1.submitAssignment)(assignmentId, userId, documentId);
        const response = {
            success: true,
            message: 'Assignment submitted successfully',
            submission,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error submitting assignment:', error);
        // Handle specific error cases
        if (error instanceof Error && (error.message.includes('not found') || error.message.includes('not a member'))) {
            const response = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }
        const response = {
            success: false,
            message: 'Failed to submit assignment',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.submitAssignmentController = submitAssignmentController;
/**
 * Get submissions for an assignment
 */
const getAssignmentSubmissionsController = async (req, res) => {
    try {
        const { id: assignmentId } = req.params;
        const userId = req.user.id;
        // Check if assignment exists
        const assignment = await (0, assignment_service_1.getAssignmentById)(assignmentId);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Assignment not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the creator, a teacher, or an admin
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isCreator && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: 'Unauthorized to view submissions for this assignment',
            };
            res.status(403).json(response);
        }
        const submissions = await (0, assignment_service_1.getAssignmentSubmissions)(assignmentId);
        const response = {
            success: true,
            submissions,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting assignment submissions:', error);
        const response = {
            success: false,
            message: 'Failed to get assignment submissions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getAssignmentSubmissionsController = getAssignmentSubmissionsController;
/**
 * Get a submission by ID
 */
const getSubmissionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const submission = await (0, assignment_service_1.getSubmissionById)(id);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Get assignment details
        const assignment = await (0, assignment_service_1.getAssignmentById)(submission === null || submission === void 0 ? void 0 : submission.assignmentId);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Associated assignment not found',
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to view this submission
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        if (!isSubmitter && !isCreator && !isTeacherOrAdmin) {
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
        const submission = await (0, assignment_service_1.getSubmissionById)(id);
        if (!submission) {
            const response = {
                success: false,
                message: 'Submission not found',
            };
            res.status(404).json(response);
        }
        // Get assignment details
        const assignment = await (0, assignment_service_1.getAssignmentById)(submission === null || submission === void 0 ? void 0 : submission.assignmentId);
        if (!assignment) {
            const response = {
                success: false,
                message: 'Associated assignment not found',
            };
            res.status(404).json(response);
        }
        // Determine authorization
        const isTeacherOrAdmin = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        // Only the submitter can change from DRAFT to SUBMITTED
        // Only teachers, admins, or the assignment creator can change other statuses
        if ((status === 'SUBMITTED' && !isSubmitter) ||
            (status !== 'SUBMITTED' && !isTeacherOrAdmin && !isCreator)) {
            const response = {
                success: false,
                message: 'Unauthorized to update this submission status',
            };
            res.status(403).json(response);
        }
        const updatedSubmission = await (0, assignment_service_1.updateSubmissionStatus)(id, status);
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
