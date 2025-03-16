import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiResponse } from '../types/response';

/**
 * Validation source in the request
 */
type ValidationSource = 'body' | 'query' | 'params' | 'headers' | 'cookies';

/**
 * Middleware factory for validating request data against Zod schemas
 * 
 * @param schema Zod schema to validate against
 * @param source Which part of the request to validate (default: 'body')
 */
export const validate = (schema: AnyZodObject, source: ValidationSource = 'body') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get data from the specified request source
            const data = req[source];

            // Validate the data against the schema
            const validatedData = await schema.parseAsync(data);

            // Replace the request data with the validated data
            // This ensures type correctness and any transformations are applied
            req[source] = validatedData;

            // Continue to the next middleware or route handler
            next();
        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof ZodError) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Validation failed',
                    errors: error.format()
                };

                res.status(400).json(response);
                return;
            }

            // Handle unexpected errors
            console.error('Validation middleware error:', error);

            const response: ApiResponse = {
                success: false,
                message: 'An unexpected error occurred during validation',
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    };
};