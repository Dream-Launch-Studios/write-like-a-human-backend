import { Request, Response } from 'express';
/**
 * Get a submission by ID
 */
export declare const getSubmissionByIdController: (req: Request, res: Response) => Promise<void>;
/**
 * Update submission status
 */
export declare const updateSubmissionStatusController: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a submission
 */
export declare const deleteSubmissionController: (req: Request, res: Response) => Promise<void>;
/**
 * Get submissions for the current user
 */
/**
 * Get submissions by assignment Id for the current user
 */
export declare const getUserSubmissionsByAssignmentIdController: (req: Request, res: Response) => Promise<void>;
/**
 * Resubmit an assignment
 */
export declare const resubmitAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Get feedback for a submission
 */
export declare const getSubmissionFeedbackController: (req: Request, res: Response) => Promise<void>;
/**
 * Add feedback to a submission
 */
export declare const addSubmissionFeedbackController: (req: Request, res: Response) => Promise<void>;
export declare const finalSubmitAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Controller for handling submission evaluation requests
 */
export declare const evaluateSubmissionController: (req: Request, res: Response) => Promise<void>;
