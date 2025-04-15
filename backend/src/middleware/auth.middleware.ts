import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types/response';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);


export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const response: ApiResponse = {
                success: false,
                message: 'Missing authorization header'
            };
            res.status(401).json(response);
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            const response: ApiResponse = {
                success: false,
                message: 'Invalid authorization format'
            };
            res.status(401).json(response);
            return;
        }

        let userId;

        try {
            // Decode the token directly without verifying with Supabase
            const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            userId = decodedToken.sub;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Invalid token - cannot identify user'
                };
                res.status(401).json(response);
                return;
            }

            console.log('Using decoded user ID from token:', userId);
        } catch (tokenError) {
            console.error('Token processing error:', tokenError);
            const response: ApiResponse = {
                success: false,
                message: 'Invalid token format'
            };
            res.status(401).json(response);
            return;
        }

        // Query our database directly for the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            const response: ApiResponse = {
                success: false,
                message: 'User not found in database'
            };
            res.status(404).json(response);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        const response: ApiResponse = {
            success: false,
            message: 'Server error during authentication'
        };
        res.status(500).json(response);
    }
};


export const roleMiddleware = (roles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Authentication required'
                };
                res.status(401).json(response);
                return;
            }

            const allowedRoles = Array.isArray(roles) ? roles : [roles];

            if (!allowedRoles.includes(req.user.role)) {
                const response: ApiResponse = {
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                };
                res.status(403).json(response);
                return;
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            const response: ApiResponse = {
                success: false,
                message: 'Server error during role verification'
            };
            res.status(500).json(response);
        }
    };
};

export const teacherMiddleware = roleMiddleware(['TEACHER', 'ADMIN']);
export const adminMiddleware = roleMiddleware('ADMIN');
export const studentMiddleware = roleMiddleware(['STUDENT']);