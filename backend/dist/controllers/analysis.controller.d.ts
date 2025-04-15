import { Request, Response } from 'express';
/**
 * Analyze a document for AI content
 */
export declare const analyzeDocument: (req: Request, res: Response) => Promise<void>;
/**
 * Get AI analysis results for a document
 */
export declare const getAnalysis: (req: Request, res: Response) => Promise<void>;
/**
 * Get document sections with AI detection
 */
export declare const getDocumentSections: (req: Request, res: Response) => Promise<void>;
/**
 * Get document text metrics
 */
export declare const getTextMetrics: (req: Request, res: Response) => Promise<void>;
