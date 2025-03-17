import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

/**
 * Extract text content from a PDF buffer
 */
export const extractTextFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
    try {
        // Parse the PDF content
        const data = await pdfParse(pdfBuffer);

        // Return the extracted text
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

/**
 * Validate that a buffer is a valid PDF
 */
export const validatePdf = async (pdfBuffer: Buffer): Promise<boolean> => {
    try {
        // Try to load the PDF document to verify it's valid
        await PDFDocument.load(pdfBuffer);
        return true;
    } catch (error) {
        console.error('Invalid PDF:', error);
        return false;
    }
};

/**
 * Get PDF metadata
 */
export const getPdfMetadata = async (pdfBuffer: Buffer) => {
    try {
        const data = await pdfParse(pdfBuffer);

        return {
            info: data.info,
            metadata: data.metadata,
            pageCount: data.numpages
        };
    } catch (error) {
        console.error('Error getting PDF metadata:', error);
        throw new Error('Failed to get PDF metadata');
    }
};