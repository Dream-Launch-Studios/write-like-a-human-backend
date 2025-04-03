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
    status: import(".prisma/client").$Enums.SubmissionStatus;
    documentId: string;
    assignmentId: string;
    submittedAt: Date | null;
} | null>;
/**
 * Delete a submission
 */
export declare const deleteSubmission: (id: string) => Promise<boolean>;
/**
 * Get submissions for a user
 */
export declare const getUserSubmissions: (userId: string) => Promise<({
    document: {
        id: string;
        title: string;
        fileName: string;
        fileUrl: string;
    };
    assignment: {
        id: string;
        groupId: string;
        group: {
            name: string;
            id: string;
        };
        title: string;
        dueDate: Date | null;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: import(".prisma/client").$Enums.SubmissionStatus;
    documentId: string;
    assignmentId: string;
    submittedAt: Date | null;
})[]>;
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
export declare const resubmitAssignment: (data: ResubmitAssignmentData, fileBuffer: Buffer, fileName: string, fileType: string, title: string) => Promise<{
    user: {
        email: string;
        name: string | null;
        id: string;
    };
    document: {
        id: string;
        title: string;
        fileName: string;
        fileUrl: string;
    };
    assignment: {
        id: string;
        groupId: string;
        title: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: import(".prisma/client").$Enums.SubmissionStatus;
    documentId: string;
    assignmentId: string;
    submittedAt: Date | null;
}>;
/**
 * Get feedback for a submission
 */
export declare const getSubmissionFeedback: (submissionId: string) => Promise<({
    user: {
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: import(".prisma/client").$Enums.FeedbackStatus;
    groupId: string | null;
    content: string;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
})[]>;
/**
 * Add feedback to a submission
 */
export declare const addSubmissionFeedback: (data: SubmissionFeedbackData) => Promise<{
    user: {
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: import(".prisma/client").$Enums.FeedbackStatus;
    groupId: string | null;
    content: string;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
}>;
