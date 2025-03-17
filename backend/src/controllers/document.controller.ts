import { Request, Response } from 'express';
import * as documentService from '../services/document.service';
import * as pdfService from '../services/pdf.service';
import { ApiResponse } from '../types/response';

/**
 * Upload and create a new document
 */
export const createDocument = async (req: Request, res: Response): Promise<void> => {
    try {

        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        // Extract text from the PDF
        const pdfBuffer = req.file.buffer;
        let content: string;

        try {
            content = await pdfService.extractTextFromPdf(pdfBuffer);
            console.log(`📃 PDF content: ${content}`);
        } catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            const response: ApiResponse = {
                success: false,
                message: 'Error processing PDF',
                error: pdfError instanceof Error ? pdfError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }

        // Get document data from validated request
        // @ts-ignore
        const { title = req.file.originalname, groupId } = req.body;

        // Create document in the database
        const document = await documentService.createDocument({
            title,
            content,
            // @ts-ignore
            fileName: req.file.originalname,
            fileUrl: '', // Not storing the file, just the content
            // @ts-ignore
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            userId: req.user.id,
            groupId: groupId || null
        });

        const response: ApiResponse = {
            success: true,
            message: 'Document uploaded successfully',
            document: {
                id: document.id,
                title: document.title,
                fileName: document.fileName,
                createdAt: document.createdAt
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * List documents for the current user
 */
export const listDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, groupId } = req.query;

        // Get documents from service
        const { documents, pagination } = await documentService.listDocuments({
            userId: req.user.id,
            page: Number(page),
            limit: Number(limit),
            groupId: groupId as string || undefined
        });

        const response: ApiResponse = {
            success: true,
            documents,
            pagination
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error listing documents:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to list documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get a specific document
 */
export const getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(id);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        const response: ApiResponse = {
            success: true,
            document
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Update a document
 */
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);

        if (!existingDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to update the document
        if (existingDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to update this document'
            };
            res.status(403).json(response);
            return;
        }

        // Update document
        const updatedDocument = await documentService.updateDocument(id, {
            title,
            content
        });

        const response: ApiResponse = {
            success: true,
            message: 'Document updated successfully',
            document: {
                id: updatedDocument.id,
                title: updatedDocument.title,
                updatedAt: updatedDocument.updatedAt
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);

        if (!existingDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to delete the document
        if (existingDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to delete this document'
            };
            res.status(403).json(response);
            return;
        }

        // Delete document
        await documentService.deleteDocument(id);

        const response: ApiResponse = {
            success: true,
            message: 'Document deleted successfully'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Create a new version of a document
 */
export const createVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if file was uploaded
        // if (!req.file) {
        //     const response: ApiResponse = {
        //         success: false,
        //         message: 'No file uploaded'
        //     };
        //     res.status(400).json(response);
        //     return;
        // }

        const { id: parentDocumentId } = req.params;
        const { title, content } = req.body;

        // Get parent document
        const parentDocument = await documentService.getDocumentById(parentDocumentId);

        if (!parentDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Parent document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to create a version
        if (parentDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to create a version of this document'
            };
            res.status(403).json(response);
            return;
        }

        // Extract text from the PDF
        // const pdfBuffer = req.file.buffer;
        // let content: string;

        // try {
        //     content = await pdfService.extractTextFromPdf(pdfBuffer);
        // } catch (pdfError) {
        //     console.error('PDF processing error:', pdfError);
        //     const response: ApiResponse = {
        //         success: false,
        //         message: 'Error processing PDF',
        //         error: pdfError instanceof Error ? pdfError.message : 'Unknown error'
        //     };
        //     res.status(422).json(response);
        //     return;
        // }

        // Create a new version
        const newVersion = await documentService.createDocumentVersion({
            parentDocumentId,
            title: title || parentDocument.title,
            content,
            // @ts-ignore
            fileName: parentDocument.fileName,
            fileUrl: '', // Not storing the file, just the content
            // @ts-ignore
            fileType: parentDocument.fileType,
            fileSize: parentDocument.fileSize,
            userId: req.user.id,
            groupId: parentDocument.groupId
        });

        const response: ApiResponse = {
            success: true,
            message: 'New version created successfully',
            document: {
                id: newVersion.id,
                title: newVersion.title,
                versionNumber: newVersion.versionNumber,
                parentDocumentId: newVersion.parentDocumentId,
                isLatest: newVersion.isLatest,
                createdAt: newVersion.createdAt
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating document version:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create document version',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * List versions of a document
 */
export const listVersions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get the original document (first version)
        const originalDocument = await documentService.getDocumentById(id);

        if (!originalDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (originalDocument.userId !== req.user.id && originalDocument.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (originalDocument.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, originalDocument.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get document versions
        const versions = await documentService.getDocumentVersions(id);

        const response: ApiResponse = {
            success: true,
            versions
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error listing document versions:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to list document versions',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};