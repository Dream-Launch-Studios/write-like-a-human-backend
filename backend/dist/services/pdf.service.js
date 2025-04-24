"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHtmlFromDocument = exports.extractTextFromDocx = exports.extractHtmlFromDocx = exports.extractHtmlFromPdf = exports.getPdfMetadata = exports.validateDocx = exports.validatePdf = exports.extractTextFromPdf = void 0;
const pdf_lib_1 = require("pdf-lib");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const pdf_js_extract_1 = require("pdf.js-extract");
const mammoth_1 = __importDefault(require("mammoth"));
const pdfExtract = new pdf_js_extract_1.PDFExtract();
/**
 * Extract text content from a PDF buffer
 */
const extractTextFromPdf = async (pdfBuffer) => {
    try {
        const data = await (0, pdf_parse_1.default)(pdfBuffer);
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
 * Validate that a buffer is a valid DOCX
 */
const validateDocx = async (docxBuffer) => {
    try {
        const result = await mammoth_1.default.extractRawText({ buffer: docxBuffer });
        return result && typeof result.value === 'string';
    }
    catch (error) {
        console.error('Invalid DOCX:', error);
        return false;
    }
};
exports.validateDocx = validateDocx;
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
/**
 * Extract HTML content from a PDF buffer
 * Returns only the basic text content with minimal HTML
 *
 * Note: Uses pdf.js-extract which is entirely JavaScript-based (no Java dependency)
 */
const extractHtmlFromPdf = async (pdfBuffer) => {
    try {
        const options = {};
        const data = await pdfExtract.extractBuffer(pdfBuffer, options);
        let html = '';
        for (let i = 0; i < data.pages.length; i++) {
            const page = data.pages[i];
            // Sort content by Y position and then X position to get reading order
            const sortedContent = [...page.content].sort((a, b) => {
                // Group items that are roughly on the same line (within 5px)
                if (Math.abs(a.y - b.y) < 5) {
                    return a.x - b.x; // If on same line, sort by x (left to right)
                }
                return a.y - b.y; // Otherwise sort by y (top to bottom)
            });
            // Extract text from this page
            let pageText = '';
            let lastY = -1;
            for (const content of sortedContent) {
                // Skip empty strings
                if (!content.str.trim())
                    continue;
                // Check if we're on a new line
                if (lastY !== -1 && Math.abs(content.y - lastY) > 5) {
                    pageText += '<br>';
                }
                // Add space if needed between words
                if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('<br>') &&
                    !content.str.startsWith(' ')) {
                    pageText += ' ';
                }
                // Add this content
                pageText += escapeHtml(content.str);
                lastY = content.y;
            }
            // Add the page text
            html += pageText;
            // Add a simple break between pages if not the last page
            if (i < data.pages.length - 1) {
                html += '<br><br>';
            }
        }
        return html;
    }
    catch (error) {
        console.error('Error extracting HTML from PDF:', error);
        throw new Error('Failed to extract HTML from PDF');
    }
};
exports.extractHtmlFromPdf = extractHtmlFromPdf;
/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/**
 * Extract HTML content from a DOCX buffer
 * Returns the document content as HTML
 */
const extractHtmlFromDocx = async (docxBuffer) => {
    try {
        // Use mammoth to convert DOCX to HTML
        const result = await mammoth_1.default.convertToHtml({ buffer: docxBuffer });
        // Return the HTML content
        return result.value;
    }
    catch (error) {
        console.error('Error extracting HTML from DOCX:', error);
        throw new Error('Failed to extract HTML from DOCX');
    }
};
exports.extractHtmlFromDocx = extractHtmlFromDocx;
/**
 * Extract text content from a DOCX buffer
 */
const extractTextFromDocx = async (docxBuffer) => {
    try {
        // Use mammoth to extract text from DOCX
        const result = await mammoth_1.default.extractRawText({ buffer: docxBuffer });
        // Return the text content
        return result.value;
    }
    catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX');
    }
};
exports.extractTextFromDocx = extractTextFromDocx;
/**
 * Determine document type and extract HTML content
 * Supports PDF and DOCX formats
 */
const extractHtmlFromDocument = async (buffer, mimeType) => {
    try {
        // Check the document type based on mime type
        if (mimeType === 'application/pdf') {
            return await (0, exports.extractHtmlFromPdf)(buffer);
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return await (0, exports.extractHtmlFromDocx)(buffer);
        }
        else {
            throw new Error(`Unsupported document type: ${mimeType}`);
        }
    }
    catch (error) {
        console.error('Error extracting HTML from document:', error);
        throw new Error('Failed to extract HTML from document');
    }
};
exports.extractHtmlFromDocument = extractHtmlFromDocument;
