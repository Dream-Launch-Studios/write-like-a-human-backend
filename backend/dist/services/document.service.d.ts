import { DocumentFilter, CreateDocumentData, UpdateDocumentData, CreateVersionData } from '../types/document.types';
/**
 * Create a new document
 */
export declare const createDocument: (data: CreateDocumentData) => Promise<{
    fileUrl: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    assignmentId: string | null;
}>;
/**
 * List documents with pagination and filtering
 */
export declare const listDocuments: ({ userId, page, limit, groupId, search }: DocumentFilter) => Promise<{
    documents: {
        fileUrl: string;
        user: {
            name: string | null;
            id: string;
        };
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        versionNumber: number;
        isLatest: boolean;
        fileName: string;
        fileType: string;
        fileSize: number;
        groupId: string | null;
        rootDocumentId: string | null;
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            joinToken: string;
            adminId: string;
        } | null;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
/**
 * Get a document by ID with user and group information
 */
export declare const getDocumentById: (id: string) => Promise<({
    user: {
        name: string | null;
        id: string;
    };
    group: {
        name: string;
        id: string;
    } | null;
} & {
    fileUrl: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    assignmentId: string | null;
}) | null>;
/**
 * Update a document
 */
export declare const updateDocument: (id: string, data: UpdateDocumentData) => Promise<{
    fileUrl: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    assignmentId: string | null;
}>;
export declare const deleteDocument: (id: string) => Promise<boolean>;
/**
 * Create a new version of a document
 */
export declare const createDocumentVersion: (data: CreateVersionData) => Promise<{
    fileUrl: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    assignmentId: string | null;
}>;
/**
 * Get all versions of a document
 */
export declare const getDocumentVersions: (documentId: string) => Promise<{
    id: string;
    title: string;
    versionNumber: number;
    isLatest: boolean;
    createdAt: Date;
    userId: string;
    user: {
        email: string;
        name: string | null;
        id: string;
    };
}[]>;
/**
 * Check if a user is a member of a group
 */
export declare const isUserInGroup: (userId: string, groupId: string) => Promise<boolean>;
