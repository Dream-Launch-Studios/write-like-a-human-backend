import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
/**
 * Middleware for validating request data against Zod schemas
 *
 * @param schema Zod schema with request parts (body, params, query, etc.)
 */
export declare const validate: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
