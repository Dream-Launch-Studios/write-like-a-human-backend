"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Middleware for validating request data against Zod schemas
 *
 * @param schema Zod schema with request parts (body, params, query, etc.)
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Create an object with all request parts that might need validation
            const data = {
                body: req.body,
                params: req.params,
                query: req.query,
                headers: req.headers,
                cookies: req.cookies
            };
            // Validate the data against the schema
            const validatedData = await schema.parseAsync(data);
            // Update the request with validated data
            if (validatedData.body)
                req.body = validatedData.body;
            if (validatedData.params)
                req.params = validatedData.params;
            if (validatedData.query)
                req.query = validatedData.query;
            if (validatedData.headers)
                req.headers = validatedData.headers;
            if (validatedData.cookies)
                req.cookies = validatedData.cookies;
            // Continue to the next middleware or route handler
            next();
        }
        catch (error) {
            // Handle Zod validation errors
            if (error instanceof zod_1.ZodError) {
                const response = {
                    success: false,
                    message: 'Validation failed',
                    errors: error.format()
                };
                res.status(400).json(response);
                return;
            }
            // Handle unexpected errors
            console.error('Validation middleware error:', error);
            const response = {
                success: false,
                message: 'An unexpected error occurred during validation',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    };
};
exports.validate = validate;
