import { DocumentFilter, CreateDocumentData, UpdateDocumentData, CreateVersionData } from '../types/document.types';
/**
 * Create a new document
 */
export declare const createDocument: (data: CreateDocumentData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    groupId: string | null;
    title: string;
    content: string;
    parentDocumentId: string | null;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}>;
/**
 * List documents with pagination and filtering
 */
export declare const listDocuments: ({ userId, page, limit, groupId }: DocumentFilter) => Promise<{
    documents: {
        user: {
            name: string | null;
            id: string;
        };
        id: string;
        createdAt: Date;
        userId: string;
        group: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            joinToken: string;
            adminId: string;
        } | null;
        groupId: string | null;
        title: string;
        versionNumber: number;
        isLatest: boolean;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    groupId: string | null;
    title: string;
    content: string;
    parentDocumentId: string | null;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}) | null>;
/**
 * Update a document
 */
export declare const updateDocument: (id: string, data: UpdateDocumentData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    groupId: string | null;
    title: string;
    content: string;
    parentDocumentId: string | null;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}>;
/**
 * Delete a document
 */
export declare const deleteDocument: (id: string) => Promise<boolean>;
/**
 * Create a new version of a document
 */
export declare const createDocumentVersion: (data: CreateVersionData) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    groupId: string | null;
    title: string;
    content: string;
    parentDocumentId: string | null;
    versionNumber: number;
    isLatest: boolean;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}>;
/**
 * Get all versions of a document
 */
export declare const getDocumentVersions: (documentId: string) => Promise<{
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
}[]>;
/**
 * Check if a user is a member of a group
 */
export declare const isUserInGroup: (userId: string, groupId: string) => Promise<boolean>;
