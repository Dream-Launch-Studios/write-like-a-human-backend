import { Request, Response, NextFunction } from "express";
/**
 * Middleware to check if a user has reached their document version limit
 */
export declare const checkDocumentVersionLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if a user has reached their document limit
 */
export declare const checkDocumentLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if a user has reached their group limit
 */
export declare const checkGroupLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if a user has reached their assignment limit
 */
export declare const checkAssignmentLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if a user has reached their submission limit
 */
export declare const checkSubmissionLimitMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to check if a user has access to AI analysis
 */
export declare const checkAIAnalysisAccessMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to increment document count when a new document is created
 */
export declare const incrementDocumentCountMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to increment group count when a new group is created
 */
export declare const incrementGroupCountMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to increment assignment count when a new assignment is created
 */
export declare const incrementAssignmentCountMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware to increment submission count when a new submission is created
 */
export declare const incrementSubmissionCountMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
