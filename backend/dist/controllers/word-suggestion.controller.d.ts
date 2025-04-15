import { Request, Response } from 'express';
/**
 * Generate and add word suggestions for a document using AI
 */
export declare const generateWordSuggestionsController: (req: Request, res: Response) => Promise<void>;
/**
 * Get word suggestions for a document
 */
export declare const getDocumentWordSuggestionsController: (req: Request, res: Response) => Promise<void>;
/**
 * Accept or reject a word suggestion
 */
export declare const updateWordSuggestionController: (req: Request, res: Response) => Promise<void>;
