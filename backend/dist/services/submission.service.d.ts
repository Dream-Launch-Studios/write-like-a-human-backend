import { SubmissionStatus } from '@prisma/client';
import { ResubmitAssignmentData, SubmissionFeedbackData, SubmissionWithDetails } from '../types/submission.types';
/**
 * Upload file to Supabase storage
 */
export declare const uploadFileToStorage: (fileBuffer: Buffer, fileName: string, contentType: string) => Promise<string>;
/**
 * Get a submission by ID
 */
export declare const getSubmissionById: (id: string) => Promise<SubmissionWithDetails | null>;
/**
 * Update submission status
 */
export declare const updateSubmissionStatus: (id: string, status: SubmissionStatus) => Promise<{
    status: import(".prisma/client").$Enums.SubmissionStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string;
    documentId: string;
    submittedAt: Date | null;
} | null>;
/**
 * Delete a submission
 */
export declare const deleteSubmission: (id: string) => Promise<boolean>;
/**
 * Get submissions for a user
 */
export declare const getUserSubmissionsByAssignmentId: (userId: string, assignmentId: string) => Promise<({
    document: {
        fileUrl: string;
        id: string;
        title: string;
        fileName: string;
    };
    assignment: {
        id: string;
        title: string;
        groupId: string;
        group: {
            id: string;
            name: string;
        };
        dueDate: Date | null;
    };
    submissionResult: {
        status: import(".prisma/client").$Enums.EvaluationStatus;
        id: string;
        updatedAt: Date;
        feedback: string | null;
        grade: string | null;
    } | null;
} & {
    status: import(".prisma/client").$Enums.SubmissionStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string;
    documentId: string;
    submittedAt: Date | null;
})[]>;
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
export declare const resubmitAssignment: (data: ResubmitAssignmentData, fileBuffer: Buffer, fileName: string, fileType: string, title: string) => Promise<{
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    document: {
        fileUrl: string;
        id: string;
        title: string;
        fileName: string;
    };
    assignment: {
        id: string;
        title: string;
        groupId: string;
    };
} & {
    status: import(".prisma/client").$Enums.SubmissionStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string;
    documentId: string;
    submittedAt: Date | null;
}>;
/**
 * Get feedback for a submission
 */
export declare const getSubmissionFeedback: (submissionId: string) => Promise<({
    user: {
        id: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    };
} & {
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
})[]>;
/**
 * Add feedback to a submission
 */
export declare const addSubmissionFeedback: (data: SubmissionFeedbackData) => Promise<{
    user: {
        id: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    };
} & {
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
}>;
/**
 * Service function to handle final submission of an assignment
 * Updates submission status and creates a submission result
 */
export declare const finalSubmitAssignment: (submissionId: string, documentId: string, userId: string) => Promise<{
    submission: {
        status: import(".prisma/client").$Enums.SubmissionStatus;
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        assignmentId: string;
        documentId: string;
        submittedAt: Date | null;
    };
    submissionResult: {
        status: import(".prisma/client").$Enums.EvaluationStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rootDocumentId: string | null;
        submissionId: string;
        feedback: string | null;
        documentId: string | null;
        teacherId: string;
        grade: string | null;
    };
}>;
/**
 * Service function to handle teacher evaluation of a submission
 * Updates submission result with feedback and status
 */
export declare const evaluateSubmission: (submissionResultId: string, teacherId: string, evaluationData: SubmissionEvaluationData) => Promise<{
    status: import(".prisma/client").$Enums.EvaluationStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rootDocumentId: string | null;
    submissionId: string;
    feedback: string | null;
    documentId: string | null;
    teacherId: string;
    grade: string | null;
}>;
export interface SubmissionEvaluationData {
    feedback?: string;
    grade?: string;
}
