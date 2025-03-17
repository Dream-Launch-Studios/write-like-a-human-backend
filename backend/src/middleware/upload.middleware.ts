import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import * as pdfService from '../services/pdf.service';
import { ApiResponse } from '../types/response';

// Configure multer for memory storage (files stored in buffer, not on disk)
const storage = multer.memoryStorage();

// Create file filter for PDFs
const fileFilter = async (
    req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
) => {
    // Check mime type
    if (file.mimetype !== 'application/pdf') {
        return callback(new Error('Only PDF files are allowed'));
    }

    // For additional validation, we could check the file buffer
    // but that would require reading the file first which happens after this filter

    callback(null, true);
};

// Set up multer with configuration
export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter
});

// Post-upload validation middleware
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
            return res.status(400).json(response);
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