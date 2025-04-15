"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentMiddleware = exports.adminMiddleware = exports.teacherMiddleware = exports.roleMiddleware = exports.authMiddleware = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const response = {
                success: false,
                message: 'Missing authorization header'
            };
            res.status(401).json(response);
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            const response = {
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
                const response = {
                    success: false,
                    message: 'Invalid token - cannot identify user'
                };
                res.status(401).json(response);
                return;
            }
            console.log('Using decoded user ID from token:', userId);
        }
        catch (tokenError) {
            console.error('Token processing error:', tokenError);
            const response = {
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
            const response = {
                success: false,
                message: 'User not found in database'
            };
            res.status(404).json(response);
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        const response = {
            success: false,
            message: 'Server error during authentication'
        };
        res.status(500).json(response);
    }
};
exports.authMiddleware = authMiddleware;
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                const response = {
                    success: false,
                    message: 'Authentication required'
                };
                res.status(401).json(response);
                return;
            }
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            if (!allowedRoles.includes(req.user.role)) {
                const response = {
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                };
                res.status(403).json(response);
                return;
            }
            next();
        }
        catch (error) {
            console.error('Role middleware error:', error);
            const response = {
                success: false,
                message: 'Server error during role verification'
            };
            res.status(500).json(response);
        }
    };
};
exports.roleMiddleware = roleMiddleware;
exports.teacherMiddleware = (0, exports.roleMiddleware)(['TEACHER', 'ADMIN']);
exports.adminMiddleware = (0, exports.roleMiddleware)('ADMIN');
exports.studentMiddleware = (0, exports.roleMiddleware)(['STUDENT']);
