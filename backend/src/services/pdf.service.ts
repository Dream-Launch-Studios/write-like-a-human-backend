import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract';
import fs from 'fs';
import path from 'path';
import os from 'os';

const pdfExtract = new PDFExtract();

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

/**
 * Extract HTML content from a PDF buffer
 * Returns only the basic text content with minimal HTML
 * 
 * Note: Uses pdf.js-extract which is entirely JavaScript-based (no Java dependency)
 */
export const extractHtmlFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
    try {
        // Create options object for pdf-extract
        const options: PDFExtractOptions = {};

        // Extract the PDF data directly from the buffer
        const data = await pdfExtract.extractBuffer(pdfBuffer, options);

        // Process the extracted data into minimal HTML
        let html = '';

        // Process each page
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
                if (!content.str.trim()) continue;

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
    } catch (error) {
        console.error('Error extracting HTML from PDF:', error);
        throw new Error('Failed to extract HTML from PDF');
    }
};

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}