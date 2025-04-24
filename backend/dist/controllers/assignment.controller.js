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
exports.updateSubmissionStatusController = exports.getSubmissionByIdController = exports.getAssignmentSubmissionsController = exports.submitAssignmentController = exports.deleteAssignmentController = exports.updateAssignmentController = exports.getAssignmentByIdController = exports.getGroupAssignmentsController = exports.createAssignmentController = void 0;
const pdfService = __importStar(require("../services/pdf.service"));
const documentService = __importStar(require("../services/document.service"));
const assignment_service_1 = require("../services/assignment.service");
const client_1 = require("@prisma/client");
const supabase_1 = require("../utils/supabase");
/**
 * Create a new assignment for a group
 */
const createAssignmentController = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id: groupId } = req.params;
        const { title, description, dueDate, contentFormat, createdWith, pastedContent, } = req.body;
        const creatorId = req.user.id;
        let documentUrl = "";
        let mimeType = "";
        // Check if user is a member or admin of the group
        const isMember = await (0, assignment_service_1.isUserInGroup)(creatorId, groupId);
        if (!isMember && req.user.role !== "ADMIN" && req.user.role !== "TEACHER") {
            const response = {
                success: false,
                message: "Unauthorized to create assignments for this group",
            };
            res.status(403).json(response);
        }
        if (!pastedContent && createdWith === client_1.DocumentCreatedWith.PASTE) {
            const response = {
                success: false,
                message: "No content pasted",
            };
            res.status(400).json(response);
            return;
        }
        if (!req.file && createdWith === client_1.DocumentCreatedWith.UPLOAD) {
            const response = {
                success: false,
                message: "No file uploaded",
            };
            res.status(400).json(response);
            return;
        }
        if (createdWith === client_1.DocumentCreatedWith.UPLOAD) {
            const fileBuffer = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.buffer;
            mimeType = (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.mimetype;
            let isValid = false;
            if (mimeType === "application/pdf") {
                isValid = await pdfService.validatePdf(fileBuffer);
                if (!isValid) {
                    const response = {
                        success: false,
                        message: "Invalid PDF file",
                    };
                    res.status(422).json(response);
                    return;
                }
            }
            else if (mimeType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                isValid = await pdfService.validateDocx(fileBuffer);
                if (!isValid) {
                    const response = {
                        success: false,
                        message: "Invalid DOCX file",
                    };
                    res.status(422).json(response);
                    return;
                }
            }
            else {
                const response = {
                    success: false,
                    message: "Unsupported file type. Only PDF and DOCX are supported.",
                };
                res.status(422).json(response);
                return;
            }
            const uploadResult = await (0, supabase_1.uploadFileToSupabase)(fileBuffer, (_d = (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.originalname) !== null && _d !== void 0 ? _d : "x", mimeType, req.user.id, "assignments");
            if (!uploadResult.success) {
                const response = {
                    success: false,
                    message: "Failed to upload file to storage",
                    error: uploadResult.error,
                };
                res.status(500).json(response);
                return;
            }
            documentUrl = (_e = uploadResult.fileUrl) !== null && _e !== void 0 ? _e : "";
        }
        const assignment = await (0, assignment_service_1.createAssignment)({
            title,
            description,
            dueDate,
            documentUrl: documentUrl !== null && documentUrl !== void 0 ? documentUrl : "",
            documentName: (_f = req === null || req === void 0 ? void 0 : req.file) === null || _f === void 0 ? void 0 : _f.originalname,
            creatorId,
            groupId,
            contentFormat,
            createdWith,
            mimeType,
            pastedContent
        });
        const response = {
            success: true,
            message: "Assignment created successfully",
            assignment,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Error creating assignment:", error);
        // Handle specific error cases
        if (error instanceof Error && error.message.includes("not found")) {
            const response = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }
        const response = {
            success: false,
            message: "Failed to create assignment",
            error: error instanceof Error ? error.message : "Unknown error",
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
        if (!isMember && req.user.role !== "ADMIN") {
            const response = {
                success: false,
                message: "Unauthorized to view assignments for this group",
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
        console.error("Error getting group assignments:", error);
        const response = {
            success: false,
            message: "Failed to get group assignments",
            error: error instanceof Error ? error.message : "Unknown error",
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
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }
        // Check if user is a member or admin of the group
        const isMember = await (0, assignment_service_1.isUserInGroup)(userId, assignment === null || assignment === void 0 ? void 0 : assignment.groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            const response = {
                success: false,
                message: "Unauthorized to view this assignment",
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
        console.error("Error getting assignment:", error);
        const response = {
            success: false,
            message: "Failed to get assignment",
            error: error instanceof Error ? error.message : "Unknown error",
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
        const { title, description, dueDate, documentUrl, documentName, documentType, } = req.body;
        const userId = req.user.id;
        // Check if assignment exists
        const assignment = await (0, assignment_service_1.getAssignmentById)(id);
        if (!assignment) {
            const response = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }
        // Check if user is the creator or an admin
        if ((assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) !== userId && req.user.role !== "ADMIN") {
            const response = {
                success: false,
                message: "Unauthorized to update this assignment",
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
            message: "Assignment updated successfully",
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
        console.error("Error updating assignment:", error);
        const response = {
            success: false,
            message: "Failed to update assignment",
            error: error instanceof Error ? error.message : "Unknown error",
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
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }
        // Check if user is the creator or an admin
        if ((assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) !== userId && req.user.role !== "ADMIN") {
            const response = {
                success: false,
                message: "Unauthorized to delete this assignment",
            };
            res.status(403).json(response);
        }
        const deleted = await (0, assignment_service_1.deleteAssignment)(id);
        if (!deleted) {
            const response = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: "Assignment deleted successfully",
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error deleting assignment:", error);
        const response = {
            success: false,
            message: "Failed to delete assignment",
            error: error instanceof Error ? error.message : "Unknown error",
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
        const { groupId } = req.body;
        const userId = req.user.id;
        const isMember = await (0, assignment_service_1.isUserInGroup)(userId, groupId);
        if (!isMember && req.user.role !== "ADMIN" && req.user.role !== "TEACHER") {
            const response = {
                success: false,
                message: "Unauthorized to create assignments submission for this group",
            };
            res.status(403).json(response);
        }
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        // Validate based on file type
        let isValid = false;
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);
            if (!isValid) {
                const response = {
                    success: false,
                    message: 'Invalid PDF file'
                };
                res.status(422).json(response);
                return;
            }
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            isValid = await pdfService.validateDocx(fileBuffer);
            if (!isValid) {
                const response = {
                    success: false,
                    message: 'Invalid DOCX file'
                };
                res.status(422).json(response);
                return;
            }
        }
        else {
            const response = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            };
            res.status(422).json(response);
            return;
        }
        let htmlContent;
        try {
            htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);
        }
        catch (conversionError) {
            console.error('Document conversion error:', conversionError);
            const response = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
        const uploadResult = await (0, supabase_1.uploadFileToSupabase)(fileBuffer, req.file.originalname, mimeType, req.user.id, "assignment-submissions");
        if (!uploadResult.success) {
            const response = {
                success: false,
                message: 'Failed to upload file to storage',
                error: uploadResult.error
            };
            res.status(500).json(response);
            return;
        }
        // Get document data from validated request
        const title = req.body.title || req.file.originalname;
        const document = await documentService.createDocument({
            title,
            content: htmlContent,
            contentFormat: 'HTML',
            fileName: req.file.originalname,
            fileUrl: (_a = uploadResult.fileUrl) !== null && _a !== void 0 ? _a : "",
            fileType: mimeType,
            fileSize: req.file.size,
            userId: req.user.id,
            groupId: groupId
        });
        const submission = await (0, assignment_service_1.submitAssignment)(assignmentId, userId, document.id);
        const response = {
            success: true,
            message: "Assignment submitted successfully",
            submission,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Error submitting assignment:", error);
        // Handle specific error cases
        if (error instanceof Error &&
            (error.message.includes("not found") ||
                error.message.includes("not a member"))) {
            const response = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }
        const response = {
            success: false,
            message: "Failed to submit assignment",
            error: error instanceof Error ? error.message : "Unknown error",
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
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }
        // Check if user is the creator, a teacher, or an admin
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isTeacherOrAdmin = req.user.role === "TEACHER" || req.user.role === "ADMIN";
        if (!isCreator && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: "Unauthorized to view submissions for this assignment",
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
        console.error("Error getting assignment submissions:", error);
        const response = {
            success: false,
            message: "Failed to get assignment submissions",
            error: error instanceof Error ? error.message : "Unknown error",
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
                message: "Submission not found",
            };
            res.status(404).json(response);
        }
        // Get assignment details
        const assignment = await (0, assignment_service_1.getAssignmentById)(submission === null || submission === void 0 ? void 0 : submission.assignmentId);
        if (!assignment) {
            const response = {
                success: false,
                message: "Associated assignment not found",
            };
            res.status(404).json(response);
        }
        // Check if user is authorized to view this submission
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isTeacherOrAdmin = req.user.role === "TEACHER" || req.user.role === "ADMIN";
        if (!isSubmitter && !isCreator && !isTeacherOrAdmin) {
            const response = {
                success: false,
                message: "Unauthorized to view this submission",
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
        console.error("Error getting submission:", error);
        const response = {
            success: false,
            message: "Failed to get submission",
            error: error instanceof Error ? error.message : "Unknown error",
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
                message: "Submission not found",
            };
            res.status(404).json(response);
        }
        // Get assignment details
        const assignment = await (0, assignment_service_1.getAssignmentById)(submission === null || submission === void 0 ? void 0 : submission.assignmentId);
        if (!assignment) {
            const response = {
                success: false,
                message: "Associated assignment not found",
            };
            res.status(404).json(response);
        }
        // Determine authorization
        const isTeacherOrAdmin = req.user.role === "TEACHER" || req.user.role === "ADMIN";
        const isCreator = (assignment === null || assignment === void 0 ? void 0 : assignment.creatorId) === userId;
        const isSubmitter = (submission === null || submission === void 0 ? void 0 : submission.userId) === userId;
        // Only the submitter can change from DRAFT to SUBMITTED
        // Only teachers, admins, or the assignment creator can change other statuses
        if ((status === "SUBMITTED" && !isSubmitter) ||
            (status !== "SUBMITTED" && !isTeacherOrAdmin && !isCreator)) {
            const response = {
                success: false,
                message: "Unauthorized to update this submission status",
            };
            res.status(403).json(response);
        }
        const updatedSubmission = await (0, assignment_service_1.updateSubmissionStatus)(id, status);
        const response = {
            success: true,
            message: "Submission status updated successfully",
            submission: {
                id: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.id,
                status: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.status,
                updatedAt: updatedSubmission === null || updatedSubmission === void 0 ? void 0 : updatedSubmission.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error updating submission status:", error);
        const response = {
            success: false,
            message: "Failed to update submission status",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
    }
};
exports.updateSubmissionStatusController = updateSubmissionStatusController;
