/**
 * Extract text content from a PDF buffer
 */
export declare const extractTextFromPdf: (pdfBuffer: Buffer) => Promise<string>;
/**
 * Validate that a buffer is a valid PDF
 */
export declare const validatePdf: (pdfBuffer: Buffer) => Promise<boolean>;
/**
 * Validate that a buffer is a valid DOCX
 */
export declare const validateDocx: (docxBuffer: Buffer) => Promise<boolean>;
/**
 * Get PDF metadata
 */
export declare const getPdfMetadata: (pdfBuffer: Buffer) => Promise<{
    info: any;
    metadata: any;
    pageCount: number;
}>;
/**
 * Extract HTML content from a PDF buffer
 * Returns only the basic text content with minimal HTML
 *
 * Note: Uses pdf.js-extract which is entirely JavaScript-based (no Java dependency)
 */
export declare const extractHtmlFromPdf: (pdfBuffer: Buffer) => Promise<string>;
/**
 * Extract HTML content from a DOCX buffer
 * Returns the document content as HTML
 */
export declare const extractHtmlFromDocx: (docxBuffer: Buffer) => Promise<string>;
/**
 * Extract text content from a DOCX buffer
 */
export declare const extractTextFromDocx: (docxBuffer: Buffer) => Promise<string>;
/**
 * Determine document type and extract HTML content
 * Supports PDF and DOCX formats
 */
export declare const extractHtmlFromDocument: (buffer: Buffer, mimeType: string) => Promise<string>;
