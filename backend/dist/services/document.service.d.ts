import { DocumentFilter, CreateDocumentData, UpdateDocumentData, CreateVersionData } from '../types/document.types';
/**
 * Create a new document
 */
export declare const createDocument: (data: CreateDocumentData) => Promise<{
    id: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    userId: string;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string | null;
    versionCount: number;
}>;
/**
 * List documents with pagination and filtering
 */
export declare const listDocuments: ({ userId, page, limit, groupId, search }: DocumentFilter) => Promise<{
    documents: {
        user: {
            id: string;
            name: string | null;
        };
        group: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            joinToken: string;
            adminId: string;
        } | null;
        id: string;
        title: string;
        versionNumber: number;
        isLatest: boolean;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        groupId: string | null;
        userId: string;
        rootDocumentId: string | null;
        createdAt: Date;
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
        id: string;
        name: string | null;
    };
    group: {
        id: string;
        name: string;
    } | null;
} & {
    id: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    userId: string;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string | null;
    versionCount: number;
}) | null>;
/**
 * Update a document
 */
export declare const updateDocument: (id: string, data: UpdateDocumentData) => Promise<{
    id: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    userId: string;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string | null;
    versionCount: number;
}>;
export declare const deleteDocument: (id: string) => Promise<boolean>;
/**
 * Create a new version of a document
 */
export declare const createDocumentVersion: (data: CreateVersionData) => Promise<{
    id: string;
    title: string;
    content: string;
    createdWith: import(".prisma/client").$Enums.DocumentCreatedWith;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    groupId: string | null;
    userId: string;
    contentFormat: import(".prisma/client").$Enums.ContentFormat;
    feedbackMetricsId: string | null;
    rootDocumentId: string | null;
    submissionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignmentId: string | null;
    versionCount: number;
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
        id: string;
        name: string | null;
        email: string;
    };
}[]>;
/**
 * Check if a user is a member of a group
 */
export declare const isUserInGroup: (userId: string, groupId: string) => Promise<boolean>;
