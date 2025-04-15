import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<any>;
export declare const login: (req: Request, res: Response) => Promise<any>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<any>;
/**
 * Update user details
 * @param req - Express request
 * @param res - Express response
 */
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update email verification status (Admin only)
 * Dedicated endpoint for email verification
 */
export declare const updateEmailVerification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get user details
 * @param req - Express request
 * @param res - Express response
 */
export declare const getUserDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
