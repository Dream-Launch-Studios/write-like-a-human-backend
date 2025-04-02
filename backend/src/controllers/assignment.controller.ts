import { Request, Response } from "express";
import * as pdfService from "../services/pdf.service";
import {
    createAssignment,
    getGroupAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getAssignmentSubmissions,
    getSubmissionById,
    updateSubmissionStatus,
    isUserInGroup,
} from "../services/assignment.service";
import { ApiResponse } from "../types/assignment.types";
import { DocumentCreatedWith } from "@prisma/client";
import { uploadFileToSupabase } from "../utils/supabase";

/**
 * Create a new assignment for a group
 */
export const createAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: groupId } = req.params;
        const {
            title,
            description,
            dueDate,
            contentFormat,
            createdWith,
            pastedContent,
        } = req.body;
        const creatorId = req.user.id;
        let documentUrl: string = "";
        let mimeType: string = "";

        // Check if user is a member or admin of the group
        const isMember = await isUserInGroup(creatorId, groupId);
        if (!isMember && req.user.role !== "ADMIN" && req.user.role !== "TEACHER") {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to create assignments for this group",
            };
            res.status(403).json(response);
        }

        if (!pastedContent && createdWith === DocumentCreatedWith.PASTE) {
            const response: ApiResponse = {
                success: false,
                message: "No content pasted",
            };
            res.status(400).json(response);
            return;
        }

        if (!req.file && createdWith === DocumentCreatedWith.UPLOAD) {
            const response: ApiResponse = {
                success: false,
                message: "No file uploaded",
            };
            res.status(400).json(response);
            return;
        }

        if (createdWith === DocumentCreatedWith.UPLOAD) {
            const fileBuffer = req?.file?.buffer;
            mimeType = req?.file?.mimetype!;
            let isValid = false;
            if (mimeType === "application/pdf") {
                isValid = await pdfService.validatePdf(fileBuffer!);
                if (!isValid) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Invalid PDF file",
                    };
                    res.status(422).json(response);
                    return;
                }
            } else if (
                mimeType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                isValid = await pdfService.validateDocx(fileBuffer!);
                if (!isValid) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Invalid DOCX file",
                    };
                    res.status(422).json(response);
                    return;
                }
            } else {
                const response: ApiResponse = {
                    success: false,
                    message: "Unsupported file type. Only PDF and DOCX are supported.",
                };
                res.status(422).json(response);
                return;
            }

            const uploadResult = await uploadFileToSupabase(
                fileBuffer as Buffer,
                req?.file?.originalname ?? "x",
                mimeType,
                req.user.id,
                "assignments"
            );
            if (!uploadResult.success) {
                const response: ApiResponse = {
                    success: false,
                    message: "Failed to upload file to storage",
                    error: uploadResult.error,
                };
                res.status(500).json(response);
                return;
            }
            documentUrl = uploadResult.fileUrl ?? ""
        }

        const assignment = await createAssignment({
            title,
            description,
            dueDate,
            documentUrl: documentUrl ?? "",
            documentName: req?.file?.originalname,
            creatorId,
            groupId,
            contentFormat,
            createdWith,
            mimeType,
            pastedContent
        });

        const response: ApiResponse = {
            success: true,
            message: "Assignment created successfully",
            assignment,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error("Error creating assignment:", error);

        // Handle specific error cases
        if (error instanceof Error && error.message.includes("not found")) {
            const response: ApiResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: false,
            message: "Failed to create assignment",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Get assignments for a group
 */
export const getGroupAssignmentsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: groupId } = req.params;
        const userId = req.user.id;

        // Check if user is a member or admin of the group
        const isMember = await isUserInGroup(userId, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to view assignments for this group",
            };
            res.status(403).json(response);
        }

        const assignments = await getGroupAssignments(groupId);

        const response: ApiResponse = {
            success: true,
            assignments,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting group assignments:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to get group assignments",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Get an assignment by ID
 */
export const getAssignmentByIdController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const assignment = await getAssignmentById(id);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }

        // Check if user is a member or admin of the group
        const isMember = await isUserInGroup(userId, assignment?.groupId!);
        if (!isMember && req.user.role !== "ADMIN") {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to view this assignment",
            };
            res.status(403).json(response);
        }

        const response: ApiResponse = {
            success: true,
            assignment,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting assignment:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to get assignment",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Update an assignment
 */
export const updateAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            dueDate,
            documentUrl,
            documentName,
            documentType,
        } = req.body;
        const userId = req.user.id;

        // Check if assignment exists
        const assignment = await getAssignmentById(id);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }

        // Check if user is the creator or an admin
        if (assignment?.creatorId !== userId && req.user.role !== "ADMIN") {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to update this assignment",
            };
            res.status(403).json(response);
        }

        const updatedAssignment = await updateAssignment(id, {
            title,
            description,
            dueDate,
            documentUrl,
            documentName,
            documentType,
        });

        const response: ApiResponse = {
            success: true,
            message: "Assignment updated successfully",
            assignment: {
                id: updatedAssignment?.id,
                title: updatedAssignment?.title,
                description: updatedAssignment?.description,
                dueDate: updatedAssignment?.dueDate,
                updatedAt: updatedAssignment?.updatedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error updating assignment:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to update assignment",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Delete an assignment
 */
export const deleteAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if assignment exists
        const assignment = await getAssignmentById(id);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }

        // Check if user is the creator or an admin
        if (assignment?.creatorId !== userId && req.user.role !== "ADMIN") {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to delete this assignment",
            };
            res.status(403).json(response);
        }

        const deleted = await deleteAssignment(id);

        if (!deleted) {
            const response: ApiResponse = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: "Assignment deleted successfully",
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error deleting assignment:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to delete assignment",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Submit an assignment
 */
export const submitAssignmentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: assignmentId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        // This would typically come from a file upload process
        // For this example, we'll assume the document has already been created
        // and the ID is passed in the request
        const documentId = req.file?.path || "";

        if (!documentId) {
            const response: ApiResponse = {
                success: false,
                message: "No document provided",
            };
            res.status(400).json(response);
        }

        const submission = await submitAssignment(assignmentId, userId, documentId);

        const response: ApiResponse = {
            success: true,
            message: "Assignment submitted successfully",
            submission,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error("Error submitting assignment:", error);

        // Handle specific error cases
        if (
            error instanceof Error &&
            (error.message.includes("not found") ||
                error.message.includes("not a member"))
        ) {
            const response: ApiResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: false,
            message: "Failed to submit assignment",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Get submissions for an assignment
 */
export const getAssignmentSubmissionsController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id: assignmentId } = req.params;
        const userId = req.user.id;

        // Check if assignment exists
        const assignment = await getAssignmentById(assignmentId);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Assignment not found",
            };
            res.status(404).json(response);
        }

        // Check if user is the creator, a teacher, or an admin
        const isCreator = assignment?.creatorId === userId;
        const isTeacherOrAdmin =
            req.user.role === "TEACHER" || req.user.role === "ADMIN";

        if (!isCreator && !isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to view submissions for this assignment",
            };
            res.status(403).json(response);
        }

        const submissions = await getAssignmentSubmissions(assignmentId);

        const response: ApiResponse = {
            success: true,
            submissions,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting assignment submissions:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to get assignment submissions",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Get a submission by ID
 */
export const getSubmissionByIdController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const submission = await getSubmissionById(id);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: "Submission not found",
            };
            res.status(404).json(response);
        }

        // Get assignment details
        const assignment = await getAssignmentById(submission?.assignmentId!);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Associated assignment not found",
            };
            res.status(404).json(response);
        }

        // Check if user is authorized to view this submission
        const isSubmitter = submission?.userId === userId;
        const isCreator = assignment?.creatorId === userId;
        const isTeacherOrAdmin =
            req.user.role === "TEACHER" || req.user.role === "ADMIN";

        if (!isSubmitter && !isCreator && !isTeacherOrAdmin) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to view this submission",
            };
            res.status(403).json(response);
        }

        const response: ApiResponse = {
            success: true,
            submission,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting submission:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to get submission",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};

/**
 * Update submission status
 */
export const updateSubmissionStatusController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Check if submission exists
        const submission = await getSubmissionById(id);

        if (!submission) {
            const response: ApiResponse = {
                success: false,
                message: "Submission not found",
            };
            res.status(404).json(response);
        }

        // Get assignment details
        const assignment = await getAssignmentById(submission?.assignmentId!);

        if (!assignment) {
            const response: ApiResponse = {
                success: false,
                message: "Associated assignment not found",
            };
            res.status(404).json(response);
        }

        // Determine authorization
        const isTeacherOrAdmin =
            req.user.role === "TEACHER" || req.user.role === "ADMIN";
        const isCreator = assignment?.creatorId === userId;
        const isSubmitter = submission?.userId === userId;

        // Only the submitter can change from DRAFT to SUBMITTED
        // Only teachers, admins, or the assignment creator can change other statuses
        if (
            (status === "SUBMITTED" && !isSubmitter) ||
            (status !== "SUBMITTED" && !isTeacherOrAdmin && !isCreator)
        ) {
            const response: ApiResponse = {
                success: false,
                message: "Unauthorized to update this submission status",
            };
            res.status(403).json(response);
        }

        const updatedSubmission = await updateSubmissionStatus(id, status);

        const response: ApiResponse = {
            success: true,
            message: "Submission status updated successfully",
            submission: {
                id: updatedSubmission?.id,
                status: updatedSubmission?.status,
                updatedAt: updatedSubmission?.updatedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error updating submission status:", error);

        const response: ApiResponse = {
            success: false,
            message: "Failed to update submission status",
            error: error instanceof Error ? error.message : "Unknown error",
        };

        res.status(500).json(response);
    }
};
