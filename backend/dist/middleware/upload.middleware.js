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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePdfMiddleware = exports.validateDocumentMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const pdfService = __importStar(require("../services/pdf.service"));
// Configure multer for memory storage (files stored in buffer, not on disk)
const storage = multer_1.default.memoryStorage();
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
const fileFilter = async (req, file, callback) => {
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
exports.uploadMiddleware = (0, multer_1.default)({
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
const validateDocumentMiddleware = async (req, res, next) => {
    var _a, _b, _c;
    try {
        // In your middleware
        console.log("File type:", (_a = req.file) === null || _a === void 0 ? void 0 : _a.mimetype);
        console.log("File route:", req.path);
        // In your controller before validation
        console.log("Processing file:", (_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname, "with type:", (_c = req.file) === null || _c === void 0 ? void 0 : _c.mimetype);
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
                const response = {
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
                const response = {
                    success: false,
                    message: 'The uploaded file is not a valid DOCX'
                };
                res.status(400).json(response);
                return; // Important: return here to prevent calling next()
            }
        }
        else {
            // Unsupported file type
            const response = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are allowed.'
            };
            res.status(400).json(response);
            return;
        }
        // If we got here, validation passed
        next();
    }
    catch (error) {
        console.error('Document validation error:', error);
        const response = {
            success: false,
            message: 'Error validating uploaded file',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.validateDocumentMiddleware = validateDocumentMiddleware;
// Legacy PDF middleware for backward compatibility
const validatePdfMiddleware = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        // Validate that the file is actually a valid PDF
        const isValid = await pdfService.validatePdf(req.file.buffer);
        if (!isValid) {
            const response = {
                success: false,
                message: 'The uploaded file is not a valid PDF'
            };
            res.status(400).json(response);
            return;
        }
        next();
    }
    catch (error) {
        console.error('PDF validation error:', error);
        const response = {
            success: false,
            message: 'Error validating PDF file',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.validatePdfMiddleware = validatePdfMiddleware;
