import { Request, Response } from 'express';
/**
 * Create feedback for a document
 */
export declare const createFeedback: (req: Request, res: Response) => Promise<void>;
/**
 * Get all feedback for a document
 */
export declare const getDocumentFeedback: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific feedback by ID
 */
export declare const getFeedback: (req: Request, res: Response) => Promise<void>;
/**
 * Update feedback
 */
export declare const updateFeedback: (req: Request, res: Response) => Promise<void>;
/**
 * Delete feedback
 */
export declare const deleteFeedback: (req: Request, res: Response) => Promise<void>;
/**
 * Get feedback metrics
 */
export declare const getFeedbackMetrics: (req: Request, res: Response) => Promise<void>;
