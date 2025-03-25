import { SubmissionStatus } from '@prisma/client';
import { CreateAssignmentData, UpdateAssignmentData, AssignmentWithCreator, AssignmentWithDetails, SubmissionWithUserAndDocument } from '../types/assignment.types';
/**
 * Upload file to Supabase storage
 */
export declare const uploadFileToStorage: (fileBuffer: Buffer, fileName: string, contentType: string) => Promise<string>;
/**
 * Create a new assignment
 */
export declare const createAssignment: (data: CreateAssignmentData, fileBuffer?: Buffer, fileName?: string, fileType?: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    groupId: string;
    title: string;
    description: string;
    dueDate: Date | null;
    documentUrl: string | null;
    documentName: string | null;
    documentType: string | null;
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
    groupId: string;
    title: string;
    description: string;
    dueDate: Date | null;
    documentUrl: string | null;
    documentName: string | null;
    documentType: string | null;
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
/**
 * Submit an assignment
 */
export declare const submitAssignment: (assignmentId: string, userId: string, documentId: string) => Promise<{
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
 * Get submissions for an assignment
 */
export declare const getAssignmentSubmissions: (assignmentId: string) => Promise<({
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
 * Get a submission by ID
 */
export declare const getSubmissionById: (id: string) => Promise<SubmissionWithUserAndDocument | null>;
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
        groupId: string;
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
