/**
 * Interface for document filtering parameters
 */
export interface DocumentFilter {
    userId: string;
    page?: number;
    limit?: number;
    groupId?: string;
}
/**
 * Interface for creating a document
 */
export interface CreateDocumentData {
    title: string;
    content: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    userId: string;
    groupId?: string | null;
}
/**
 * Interface for updating a document
 */
export interface UpdateDocumentData {
    title?: string;
    content?: string;
}
/**
 * Interface for creating a new version of a document
 */
export interface CreateVersionData extends CreateDocumentData {
    parentDocumentId: string;
}
