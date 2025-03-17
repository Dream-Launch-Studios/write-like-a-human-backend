/**
 * Extract text content from a PDF buffer
 */
export declare const extractTextFromPdf: (pdfBuffer: Buffer) => Promise<string>;
/**
 * Validate that a buffer is a valid PDF
 */
export declare const validatePdf: (pdfBuffer: Buffer) => Promise<boolean>;
/**
 * Get PDF metadata
 */
export declare const getPdfMetadata: (pdfBuffer: Buffer) => Promise<{
    info: any;
    metadata: any;
    pageCount: number;
}>;
