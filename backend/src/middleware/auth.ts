import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import prisma from '../config/config';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Missing authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: data.user.id }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

export const roleMiddleware = (roles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Ensure user exists (auth middleware should run first)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const allowedRoles = Array.isArray(roles) ? roles : [roles];

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();

        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error during role verification'
            });
        }
    };
};

export const teacherMiddleware = roleMiddleware(['TEACHER', 'ADMIN']);
export const adminMiddleware = roleMiddleware('ADMIN');
export const studentMiddleware = roleMiddleware(['STUDENT', 'TEACHER', 'ADMIN']);