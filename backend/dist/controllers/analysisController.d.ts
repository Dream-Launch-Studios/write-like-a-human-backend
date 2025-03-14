import { Response } from "express";
import { AuthenticatedRequest } from "../types";
/**
 * Analyze raw text submitted by user
 */
export declare const analyzeRawText: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Analyze a document from the database
 */
export declare const analyzeDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Compare two versions of a document
 */
export declare const compareDocumentVersions: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Generate word-level suggestions for a document
 */
export declare const generateDocumentSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Save feedback from the analysis
 */
export declare const saveFeedback: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
