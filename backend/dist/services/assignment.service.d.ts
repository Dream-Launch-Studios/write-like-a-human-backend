import { SubmissionStatus } from '@prisma/client';
import { CreateAssignmentData, UpdateAssignmentData, AssignmentWithCreator, AssignmentWithDetails, SubmissionWithUserAndDocument } from '../types/assignment.types';
/**
 * Upload file to Supabase storage
 */
export declare const uploadFileToStorage: (fileBuffer: Buffer, fileName: string, contentType: string) => Promise<string>;
/**
 * Create a new assignment
 */
export declare const createAssignment: (data: CreateAssignmentData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    fileType: string | null;
    groupId: string;
    description: string;
    pastedContent: string | null;
    dueDate: Date | null;
    documentUrl: string | null;
    documentName: string | null;
    creatorId: string;
}>;
/**
 * Get assignments for a group
 */
export declare const getGroupAssignments: (groupId: string) => Promise<AssignmentWithCreator[]>;
/**
 * Get an assignment by ID
 */
export declare const getAssignmentById: (id: string) => Promise<AssignmentWithDetails | null>;
/**
 * Update an assignment
 */
export declare const updateAssignment: (id: string, data: UpdateAssignmentData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    fileType: string | null;
    groupId: string;
    description: string;
    pastedContent: string | null;
    dueDate: Date | null;
    documentUrl: string | null;
    documentName: string | null;
    creatorId: string;
} | null>;
/**
 * Delete an assignment
 */
export declare const deleteAssignment: (id: string) => Promise<boolean>;
/**
 * Check if a user is a member of a group
 */
export declare const isUserInGroup: (userId: string, groupId: string) => Promise<boolean>;
export declare const submitAssignment: (assignmentId: string, userId: string, documentId: string) => Promise<{
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
 * Get submissions for an assignment
 */
export declare const getAssignmentSubmissions: (assignmentId: string) => Promise<({
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
    submissionResult: {
        status: import(".prisma/client").$Enums.EvaluationStatus;
        id: string;
        feedback: string | null;
        documentId: string | null;
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
 * Get a submission by ID
 */
export declare const getSubmissionById: (id: string) => Promise<SubmissionWithUserAndDocument | null>;
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
 * Get submissions for a user
 */
export declare const getUserSubmissions: (userId: string) => Promise<({
    document: {
        id: string;
        title: string;
        fileName: string;
    };
    assignment: {
        id: string;
        title: string;
        groupId: string;
        dueDate: Date | null;
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
})[]>;
