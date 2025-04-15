import { Submission } from '@prisma/client';
/**
 * Interface for submission with related data
 */
/**
 * Interface for submission with related data
 */
export interface SubmissionWithDetails extends Submission {
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    document: {
        id: string;
        title: string;
        fileName: string;
        fileUrl: string;
    };
    assignment: {
        id: string;
        title: string;
        groupId: string;
    };
}
/**
 * Interface for resubmitting an assignment
 */
export interface ResubmitAssignmentData {
    submissionId: string;
    userId: string;
    documentId: string;
}
/**
 * Interface for submission feedback
 */
export interface SubmissionFeedbackData {
    content: string;
    userId: string;
    submissionId: string;
}
/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    errors?: any;
    error?: string;
    [key: string]: any;
}
