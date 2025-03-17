"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPdfMetadata = exports.validatePdf = exports.extractTextFromPdf = void 0;
const pdf_lib_1 = require("pdf-lib");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
/**
 * Extract text content from a PDF buffer
 */
const extractTextFromPdf = async (pdfBuffer) => {
    try {
        // Parse the PDF content
        const data = await (0, pdf_parse_1.default)(pdfBuffer);
        // Return the extracted text
        return data.text;
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};
exports.extractTextFromPdf = extractTextFromPdf;
/**
 * Validate that a buffer is a valid PDF
 */
const validatePdf = async (pdfBuffer) => {
    try {
        // Try to load the PDF document to verify it's valid
        await pdf_lib_1.PDFDocument.load(pdfBuffer);
        return true;
    }
    catch (error) {
        console.error('Invalid PDF:', error);
        return false;
    }
};
exports.validatePdf = validatePdf;
/**
 * Get PDF metadata
 */
const getPdfMetadata = async (pdfBuffer) => {
    try {
        const data = await (0, pdf_parse_1.default)(pdfBuffer);
        return {
            info: data.info,
            metadata: data.metadata,
            pageCount: data.numpages
        };
    }
    catch (error) {
        console.error('Error getting PDF metadata:', error);
        throw new Error('Failed to get PDF metadata');
    }
};
exports.getPdfMetadata = getPdfMetadata;
