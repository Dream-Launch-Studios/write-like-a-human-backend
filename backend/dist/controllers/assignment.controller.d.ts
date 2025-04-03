import { Request, Response } from "express";
/**
 * Create a new assignment for a group
 */
export declare const createAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Get assignments for a group
 */
export declare const getGroupAssignmentsController: (req: Request, res: Response) => Promise<void>;
/**
 * Get an assignment by ID
 */
export declare const getAssignmentByIdController: (req: Request, res: Response) => Promise<void>;
/**
 * Update an assignment
 */
export declare const updateAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Delete an assignment
 */
export declare const deleteAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Submit an assignment
 */
export declare const submitAssignmentController: (req: Request, res: Response) => Promise<void>;
/**
 * Get submissions for an assignment
 */
export declare const getAssignmentSubmissionsController: (req: Request, res: Response) => Promise<void>;
/**
 * Get a submission by ID
 */
export declare const getSubmissionByIdController: (req: Request, res: Response) => Promise<void>;
/**
 * Update submission status
 */
export declare const updateSubmissionStatusController: (req: Request, res: Response) => Promise<void>;
