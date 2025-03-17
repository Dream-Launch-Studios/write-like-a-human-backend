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
exports.validatePdfMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const pdfService = __importStar(require("../services/pdf.service"));
// Configure multer for memory storage (files stored in buffer, not on disk)
const storage = multer_1.default.memoryStorage();
// Create file filter for PDFs
const fileFilter = async (req, file, callback) => {
    // Check mime type
    if (file.mimetype !== 'application/pdf') {
        return callback(new Error('Only PDF files are allowed'));
    }
    // For additional validation, we could check the file buffer
    // but that would require reading the file first which happens after this filter
    callback(null, true);
};
// Set up multer with configuration
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter
});
// Post-upload validation middleware
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
            return res.status(400).json(response);
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
