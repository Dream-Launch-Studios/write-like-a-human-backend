import { Assignment, ContentFormat, DocumentCreatedWith, Submission } from '@prisma/client';
/**
 * Interface for creating an assignment
 */
export interface CreateAssignmentData {
    title: string;
    description: string;
    dueDate?: Date | null;
    documentUrl?: string | null;
    documentName?: string | null;
    creatorId: string;
    groupId: string;
    createdWith?: DocumentCreatedWith;
    contentFormat: ContentFormat;
    mimeType?: string;
    pastedContent?: string;
}
/**
 * Interface for updating an assignment
 */
export interface UpdateAssignmentData {
    title?: string;
    description?: string;
    dueDate?: Date | null;
    documentUrl?: string | null;
    documentName?: string | null;
    documentType?: string | null;
}
/**
 * Interface for assignment with creator data
 */
export interface AssignmentWithCreator extends Assignment {
    creator: {
        id: string;
        name: string | null;
    };
    submissionCount: number;
}
/**
 * Interface for assignment with full details
 */
export interface AssignmentWithDetails extends Assignment {
    creator: {
        id: string;
        name: string | null;
    };
    group: {
        id: string;
        name: string;
    };
}
/**
 * Interface for submission with user and document data
 */
export interface SubmissionWithUserAndDocument extends Submission {
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
