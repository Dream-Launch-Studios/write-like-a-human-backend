import { Request, Response } from 'express';
/**
 * Get list of users with pagination and filtering
 */
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific user by ID
 */
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
/**
 * Update a user's role (admin only)
 */
export declare const updateUserRole: (req: Request, res: Response) => Promise<void>;
