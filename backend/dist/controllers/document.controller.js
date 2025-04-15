"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVersions = exports.createVersion = exports.deleteDocument = exports.updateDocument = exports.getDocument = exports.listDocuments = exports.convertDocumentToHtml = exports.createDocumentFromHtml = exports.convertPdfToHtml = exports.createDocument = void 0;
const documentService = __importStar(require("../services/document.service"));
const pdfService = __importStar(require("../services/pdf.service"));
const supabase_1 = require("../utils/supabase"); // Adjust the import path as needed
/**
 * Upload and create a new document
 */
const createDocument = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }
        // Extract text from the PDF
        const pdfBuffer = req.file.buffer;
        let content;
        try {
            // content = await pdfService.extractTextFromPdf(pdfBuffer);
            content = await pdfService.extractHtmlFromPdf(pdfBuffer);
            console.log(`📃 PDF content: ${content}`);
        }
        catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            const response = {
                success: false,
                message: 'Error processing document',
                error: pdfError instanceof Error ? pdfError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
        // Get document data from validated request
        // @ts-ignore
        const { title = req.file.originalname, groupId, contentFormat } = req.body;
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
            groupId: groupId || null,
            contentFormat: contentFormat
        });
        const response = {
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
    }
    catch (error) {
        console.error('Error creating document:', error);
        const response = {
            success: false,
            message: 'Failed to create document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createDocument = createDocument;
/**
 * Convert a PDF file to HTML
 * For use in rich text editors
 */
const convertPdfToHtml = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }
        // Validate the PDF
        const pdfBuffer = req.file.buffer;
        const isValidPdf = await pdfService.validatePdf(pdfBuffer);
        if (!isValidPdf) {
            const response = {
                success: false,
                message: 'Invalid PDF file'
            };
            res.status(422).json(response);
            return;
        }
        try {
            // Extract HTML content from the PDF
            const htmlContent = await pdfService.extractHtmlFromPdf(pdfBuffer);
            const response = {
                success: true,
                message: 'PDF converted to HTML successfully',
                data: {
                    html: htmlContent,
                    fileName: req.file.originalname,
                    fileSize: req.file.size
                }
            };
            res.status(200).json(response);
        }
        catch (conversionError) {
            console.error('PDF conversion error:', conversionError);
            const response = {
                success: false,
                message: 'Error converting PDF to HTML',
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
    }
    catch (error) {
        console.error('Error in PDF to HTML conversion:', error);
        const response = {
            success: false,
            message: 'Failed to convert PDF to HTML',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.convertPdfToHtml = convertPdfToHtml;
/**
 * Create a document from a PDF converted to HTML
 * Combines PDF to HTML conversion with document creation
 */
// export const createDocumentFromHtml = async (req: Request, res: Response): Promise<void> => {
//     try {
//         // Check if file was uploaded
//         if (!req.file) {
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'No file uploaded'
//             };
//             res.status(400).json(response);
//             return;
//         }
//         // Validate the PDF
//         const pdfBuffer = req.file.buffer;
//         const isValidPdf = await pdfService.validatePdf(pdfBuffer);
//         if (!isValidPdf) {
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Invalid PDF file'
//             };
//             res.status(422).json(response);
//             return;
//         }
//         let htmlContent: string;
//         try {
//             // Convert PDF to HTML 
//             htmlContent = await pdfService.extractHtmlFromPdf(pdfBuffer);
//         } catch (conversionError) {
//             console.error('PDF conversion error:', conversionError);
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Error converting PDF to HTML',
//                 error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
//             };
//             res.status(422).json(response);
//             return;
//         }
//         // Upload file to Supabase storage
//         const uploadResult = await uploadFileToSupabase(
//             pdfBuffer,
//             req.file.originalname,
//             req.file.mimetype,
//             req.user.id
//         );
//         // Handle upload failure
//         if (!uploadResult.success) {
//             const response: ApiResponse = {
//                 success: false,
//                 message: 'Failed to upload file to storage',
//                 error: uploadResult.error
//             };
//             res.status(500).json(response);
//             return;
//         }
//         // Get document data from validated request
//         const title = req.body.title || req.file.originalname;
//         const groupId = req.body.groupId;
//         // Create document in the database with HTML content and file URL
//         const document = await documentService.createDocument({
//             title,
//             content: htmlContent, // Store HTML content instead of plain text
//             contentFormat: 'HTML', // Add this field to your document model
//             fileName: req.file.originalname,
//             fileUrl: uploadResult.fileUrl ?? "", // Now storing the file URL from Supabase
//             fileType: req.file.mimetype,
//             fileSize: req.file.size,
//             userId: req.user.id,
//             groupId: groupId || null
//         });
//         const response: ApiResponse = {
//             success: true,
//             message: 'Document created from PDF with HTML formatting',
//             document: {
//                 id: document.id,
//                 title: document.title,
//                 fileName: document.fileName,
//                 fileUrl: document.fileUrl, // Include the file URL in the response
//                 createdAt: document.createdAt,
//                 contentFormat: 'html'
//             }
//         };
//         res.status(201).json(response);
//     } catch (error) {
//         console.error('Error creating HTML document:', error);
//         const response: ApiResponse = {
//             success: false,
//             message: 'Failed to create HTML document',
//             error: error instanceof Error ? error.message : 'Unknown error'
//         };
//         res.status(500).json(response);
//     }
// };
const createDocumentFromHtml = async (req, res) => {
    var _a;
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        // Validate based on file type
        let isValid = false;
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);
            if (!isValid) {
                const response = {
                    success: false,
                    message: 'Invalid PDF file'
                };
                res.status(422).json(response);
                return;
            }
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            isValid = await pdfService.validateDocx(fileBuffer);
            if (!isValid) {
                const response = {
                    success: false,
                    message: 'Invalid DOCX file'
                };
                res.status(422).json(response);
                return;
            }
        }
        else {
            const response = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            };
            res.status(422).json(response);
            return;
        }
        let htmlContent;
        try {
            // Extract HTML using the appropriate method
            htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);
        }
        catch (conversionError) {
            console.error('Document conversion error:', conversionError);
            const response = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
        // Upload file to Supabase storage (unchanged)
        const uploadResult = await (0, supabase_1.uploadFileToSupabase)(fileBuffer, req.file.originalname, mimeType, req.user.id);
        // Handle upload failure (unchanged)
        if (!uploadResult.success) {
            const response = {
                success: false,
                message: 'Failed to upload file to storage',
                error: uploadResult.error
            };
            res.status(500).json(response);
            return;
        }
        // Get document data from validated request
        const title = req.body.title || req.file.originalname;
        const groupId = req.body.groupId;
        // Create document in the database with HTML content and file URL
        const document = await documentService.createDocument({
            title,
            content: htmlContent, // Store HTML content instead of plain text
            contentFormat: 'HTML', // Add this field to your document model
            fileName: req.file.originalname,
            fileUrl: (_a = uploadResult.fileUrl) !== null && _a !== void 0 ? _a : "", // Now storing the file URL from Supabase
            fileType: mimeType,
            fileSize: req.file.size,
            userId: req.user.id,
            groupId: groupId || null
        });
        const response = {
            success: true,
            message: `Document created from ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} with HTML formatting`,
            document: {
                id: document.id,
                title: document.title,
                fileName: document.fileName,
                fileUrl: document.fileUrl, // Include the file URL in the response
                createdAt: document.createdAt,
                contentFormat: 'html'
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating HTML document:', error);
        const response = {
            success: false,
            message: 'Failed to create HTML document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createDocumentFromHtml = createDocumentFromHtml;
/**
 * Convert a document file to HTML
 * Supports PDF and DOCX formats
 * For use in rich text editors
 */
const convertDocumentToHtml = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        // Check if supported file type
        if (mimeType !== 'application/pdf' &&
            mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const response = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            };
            res.status(422).json(response);
            return;
        }
        // Validate the document based on type
        let isValid = false;
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);
        }
        else {
            isValid = await pdfService.validateDocx(fileBuffer);
        }
        if (!isValid) {
            const response = {
                success: false,
                message: `Invalid ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} file`
            };
            res.status(422).json(response);
            return;
        }
        try {
            // Extract HTML content using the appropriate method based on file type
            const htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);
            // Get metadata if PDF
            let pageCount = 0;
            if (mimeType === 'application/pdf') {
                const metadata = await pdfService.getPdfMetadata(fileBuffer);
                pageCount = metadata.pageCount;
            }
            const response = {
                success: true,
                message: `${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} converted to HTML successfully`,
                data: {
                    html: htmlContent,
                    pageCount,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: mimeType
                }
            };
            res.status(200).json(response);
        }
        catch (conversionError) {
            console.error('Document conversion error:', conversionError);
            const response = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
    }
    catch (error) {
        console.error('Error in document to HTML conversion:', error);
        const response = {
            success: false,
            message: 'Failed to convert document to HTML',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.convertDocumentToHtml = convertDocumentToHtml;
/**
 * List documents for the current user
 */
const listDocuments = async (req, res) => {
    try {
        const { page = 1, limit = 10, groupId, search } = req.query;
        // Get documents from service
        const { documents, pagination } = await documentService.listDocuments({
            userId: req.user.id,
            page: Number(page),
            limit: Number(limit),
            groupId: groupId || undefined,
            search: search || undefined
        });
        const response = {
            success: true,
            documents,
            pagination
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error listing documents:', error);
        const response = {
            success: false,
            message: 'Failed to list documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.listDocuments = listDocuments;
/**
 * Get a specific document
 */
const getDocument = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`id ${id} in getDocument`);
        // Get document from service
        const document = await documentService.getDocumentById(id);
        console.log(`document`);
        console.log(document);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        console.log(`user id ${req.user.id} in getDocument`);
        console.log(`document user id ${document.userId} in getDocument`);
        console.log(`document group id ${document.groupId} in getDocument`);
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            console.log(`⭕ Document has no group and doesn't belong to user`);
            // If document has no group and doesn't belong to user, deny access
            const response = {
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
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        const response = {
            success: true,
            document
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting document:', error);
        const response = {
            success: false,
            message: 'Failed to get document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getDocument = getDocument;
/**
 * Update a document
 */
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);
        if (!existingDocument) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user is authorized to update the document
        if (existingDocument.userId !== req.user.id) {
            const response = {
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
        const response = {
            success: true,
            message: 'Document updated successfully',
            document: {
                id: updatedDocument.id,
                title: updatedDocument.title,
                updatedAt: updatedDocument.updatedAt
            }
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating document:', error);
        const response = {
            success: false,
            message: 'Failed to update document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateDocument = updateDocument;
/**
 * Delete a document
 */
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);
        if (!existingDocument) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user is authorized to delete the document
        if (existingDocument.userId !== req.user.id) {
            const response = {
                success: false,
                message: 'You are not authorized to delete this document'
            };
            res.status(403).json(response);
            return;
        }
        // Delete document
        await documentService.deleteDocument(id);
        const response = {
            success: true,
            message: 'Document deleted successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting document:', error);
        const response = {
            success: false,
            message: 'Failed to delete document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.deleteDocument = deleteDocument;
/**
 * Create a new version of a document
 */
const createVersion = async (req, res) => {
    try {
        const { id: parentDocumentId } = req.params;
        const { title, content } = req.body;
        // Get parent document
        const parentDocument = await documentService.getDocumentById(parentDocumentId);
        if (!parentDocument) {
            const response = {
                success: false,
                message: 'Parent document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user is authorized to create a version
        if (parentDocument.userId !== req.user.id) {
            const response = {
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
            groupId: parentDocument.groupId,
            contentFormat: parentDocument.contentFormat
        });
        const response = {
            success: true,
            message: 'New version created successfully',
            document: {
                id: newVersion.id,
                title: newVersion.title,
                versionNumber: newVersion.versionNumber,
                isLatest: newVersion.isLatest,
                createdAt: newVersion.createdAt
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating document version:', error);
        const response = {
            success: false,
            message: 'Failed to create document version',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.createVersion = createVersion;
/**
 * List versions of a document
 */
const listVersions = async (req, res) => {
    try {
        const { id } = req.params;
        // Get the original document (first version)
        const originalDocument = await documentService.getDocumentById(id);
        if (!originalDocument) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (originalDocument.userId !== req.user.id && originalDocument.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
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
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Get document versions
        const versions = await documentService.getDocumentVersions(id);
        const response = {
            success: true,
            versions
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error listing document versions:', error);
        const response = {
            success: false,
            message: 'Failed to list document versions',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.listVersions = listVersions;
