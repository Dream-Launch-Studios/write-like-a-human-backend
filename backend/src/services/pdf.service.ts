import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import pdf2html from 'pdf2html';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
 * Extract HTML content from a PDF buffer with all pages combined
 * This is useful for preserving formatting when importing into rich text editors
 * 
 * Note: Requires Java Runtime Environment (JRE) to be installed
 */
export const extractHtmlFromPdf = async (pdfBuffer: Buffer): Promise<string> => {
    try {
        // Create a temporary file path in the system's temp directory
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);

        // Write buffer to temp file
        await fs.promises.writeFile(tempFilePath, pdfBuffer);

        console.log(`Temp file created at: ${tempFilePath}`);

        // Get all pages as separate HTML strings
        // @ts-ignore
        const htmlPages = await pdf2html.pages(tempFilePath, {
            maxBuffer: 1024 * 10000
        });

        // Clean up temp file
        await fs.promises.unlink(tempFilePath);
        console.log(`Temp file removed: ${tempFilePath}`);

        // Clean and combine all pages
        let combinedHtml = '';

        for (const page of htmlPages) {
            const cleanedPage = cleanHtmlContent(page);
            combinedHtml += cleanedPage;
            if (page !== htmlPages[htmlPages.length - 1]) {
                combinedHtml += '<div class="page-break"></div>';
            }
        }

        return combinedHtml;
    } catch (error) {
        console.error('Error extracting HTML from PDF:', error);
        throw new Error('Failed to extract HTML from PDF');
    }
};

/**
 * Clean HTML content by removing unwanted elements
 * @param htmlContent The raw HTML content from pdf2html
 * @returns Cleaned HTML content suitable for rich text editors
 */
function cleanHtmlContent(htmlContent: string): string {
    try {
        // Extract only the body content
        const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(htmlContent);

        if (bodyMatch && bodyMatch[1]) {
            // Get just the content inside the body tag
            let bodyContent = bodyMatch[1].trim();

            // Remove any scripts that might be in the body
            bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

            // Remove style tags
            bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

            // Remove comments
            bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

            return bodyContent;
        }

        // If body tag extraction fails, use a more aggressive approach
        // Remove doctype, html, head, meta, title, and other tags
        let cleanedContent = htmlContent
            .replace(/<!DOCTYPE[^>]*>/i, '')
            .replace(/<html[^>]*>/i, '')
            .replace(/<\/html>/i, '')
            .replace(/<head>[\s\S]*?<\/head>/i, '')
            .replace(/<body[^>]*>/i, '')
            .replace(/<\/body>/i, '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '');

        return cleanedContent.trim();
    } catch (error) {
        console.error('Error cleaning HTML content:', error);
        return htmlContent;
    }
};