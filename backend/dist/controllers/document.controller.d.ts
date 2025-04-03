import { Request, Response } from 'express';
/**
 * Upload and create a new document
 */
export declare const createDocument: (req: Request, res: Response) => Promise<void>;
/**
 * Convert a PDF file to HTML
 * For use in rich text editors
 */
export declare const convertPdfToHtml: (req: Request, res: Response) => Promise<void>;
/**
 * Create a document from a PDF converted to HTML
 * Combines PDF to HTML conversion with document creation
 */
export declare const createDocumentFromHtml: (req: Request, res: Response) => Promise<void>;
/**
 * Convert a document file to HTML
 * Supports PDF and DOCX formats
 * For use in rich text editors
 */
export declare const convertDocumentToHtml: (req: Request, res: Response) => Promise<void>;
/**
 * List documents for the current user
 */
export declare const listDocuments: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific document
 */
export declare const getDocument: (req: Request, res: Response) => Promise<void>;
/**
 * Update a document
 */
export declare const updateDocument: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a document
 */
export declare const deleteDocument: (req: Request, res: Response) => Promise<void>;
/**
 * Create a new version of a document
 */
export declare const createVersion: (req: Request, res: Response) => Promise<void>;
/**
 * List versions of a document
 */
export declare const listVersions: (req: Request, res: Response) => Promise<void>;
