import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import * as pdfService from '../services/pdf.service';
import { ApiResponse } from '../types/response';

// Configure multer for memory storage (files stored in buffer, not on disk)
const storage = multer.memoryStorage();

// Create file filter for PDFs and DOCX files
// const fileFilter = async (
//     req: Request,
//     file: Express.Multer.File,
//     callback: multer.FileFilterCallback
// ) => {
//     // Check mime type
//     const validMimeTypes = [
//         'application/pdf',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ];

//     if (!validMimeTypes.includes(file.mimetype)) {
//         return callback(new Error('Only PDF and DOCX files are allowed'));
//     }

//     // For additional validation, we could check the file buffer
//     // but that would require reading the file first which happens after this filter

//     callback(null, true);
// };


const fileFilter = async (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
) => {
    // Check mime type
    const validMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
        return callback(new Error('Only PDF and DOCX files are allowed'));
    }

    callback(null, true);
};


// Set up multer with configuration
export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit (increased for DOCX files)
    },
    fileFilter
});

// Post-upload validation middleware
// export const validateDocumentMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         if (!req.file) {
//             return next();
//         }

//         const fileBuffer = req.file.buffer;
//         const mimeType = req.file.mimetype;
//         let isValid = false;
//         let fileType = '';

//         // Validate based on file type
//         if (mimeType === 'application/pdf') {
//             isValid = await pdfService.validatePdf(fileBuffer);
//             fileType = 'PDF';
//         } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//             isValid = await pdfService.validateDocx(fileBuffer);
//             fileType = 'DOCX';
//         }

//         if (!isValid) {
//             const response: ApiResponse = {
//                 success: false,
//                 message: `The uploaded file is not a valid ${fileType}`
//             };
//             res.status(400).json(response);
//             return;
//         }

//         next();
//     } catch (error) {
//         console.error('Document validation error:', error);

//         const response: ApiResponse = {
//             success: false,
//             message: 'Error validating uploaded file',
//             error: error instanceof Error ? error.message : 'Unknown error'
//         };

//         res.status(500).json(response);
//     }
// };

export const validateDocumentMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // In your middleware
        console.log("File type:", req.file?.mimetype);
        console.log("File route:", req.path);

        // In your controller before validation
        console.log("Processing file:", req.file?.originalname, "with type:", req.file?.mimetype);


        if (!req.file) {
            return next();
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        let isValid = false;

        // Validate based on file type
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);

            if (!isValid) {
                const response: ApiResponse = {
                    success: false,
                    message: 'The uploaded file is not a valid PDF'
                };
                res.status(400).json(response);
                return; // Important: return here to prevent calling next()
            }
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            isValid = await pdfService.validateDocx(fileBuffer);

            if (!isValid) {
                const response: ApiResponse = {
                    success: false,
                    message: 'The uploaded file is not a valid DOCX'
                };
                res.status(400).json(response);
                return; // Important: return here to prevent calling next()
            }
        }
        else {
            // Unsupported file type
            const response: ApiResponse = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are allowed.'
            };
            res.status(400).json(response);
            return;
        }

        // If we got here, validation passed
        next();
    } catch (error) {
        console.error('Document validation error:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Error validating uploaded file',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


// Legacy PDF middleware for backward compatibility
export const validatePdfMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            return next();
        }

        // Validate that the file is actually a valid PDF
        const isValid = await pdfService.validatePdf(req.file.buffer);

        if (!isValid) {
            const response: ApiResponse = {
                success: false,
                message: 'The uploaded file is not a valid PDF'
            };
            res.status(400).json(response);
            return;
        }

        next();
    } catch (error) {
        console.error('PDF validation error:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Error validating PDF file',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};