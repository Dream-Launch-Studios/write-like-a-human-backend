import { Request, Response } from 'express';
/**
 * Create a new comment for a document
 */
export declare const createDocumentComment: (req: Request, res: Response) => Promise<void>;
/**
 * Get all comments for a document
 */
export declare const getDocumentCommentsController: (req: Request, res: Response) => Promise<void>;
/**
 * Update a comment
 */
export declare const updateCommentController: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a comment
 */
export declare const deleteCommentController: (req: Request, res: Response) => Promise<void>;
