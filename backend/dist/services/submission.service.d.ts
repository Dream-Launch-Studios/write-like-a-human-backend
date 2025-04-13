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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    assignmentId: string;
    status: import(".prisma/client").$Enums.SubmissionStatus;
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
        id: string;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.EvaluationStatus;
        feedback: string | null;
        grade: string | null;
    } | null;
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    assignmentId: string;
    status: import(".prisma/client").$Enums.SubmissionStatus;
    documentId: string;
    submittedAt: Date | null;
})[]>;
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
export declare const resubmitAssignment: (data: ResubmitAssignmentData, fileBuffer: Buffer, fileName: string, fileType: string, title: string) => Promise<{
    user: {
        id: string;
        email: string;
        name: string | null;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    assignmentId: string;
    status: import(".prisma/client").$Enums.SubmissionStatus;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    content: string;
    groupId: string | null;
    status: import(".prisma/client").$Enums.FeedbackStatus;
    aiScore: number | null;
    response: string | null;
    documentId: string | null;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    content: string;
    groupId: string | null;
    status: import(".prisma/client").$Enums.FeedbackStatus;
    aiScore: number | null;
    response: string | null;
    documentId: string | null;
}>;
/**
 * Service function to handle final submission of an assignment
 * Updates submission status and creates a submission result
 */
export declare const finalSubmitAssignment: (submissionId: string, documentId: string, userId: string) => Promise<{
    submission: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        assignmentId: string;
        status: import(".prisma/client").$Enums.SubmissionStatus;
        documentId: string;
        submittedAt: Date | null;
    };
    submissionResult: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rootDocumentId: string | null;
        submissionId: string;
        status: import(".prisma/client").$Enums.EvaluationStatus;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rootDocumentId: string | null;
    submissionId: string;
    status: import(".prisma/client").$Enums.EvaluationStatus;
    feedback: string | null;
    documentId: string | null;
    teacherId: string;
    grade: string | null;
}>;
export interface SubmissionEvaluationData {
    feedback?: string;
    grade?: string;
}
