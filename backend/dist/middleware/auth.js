"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentMiddleware = exports.adminMiddleware = exports.teacherMiddleware = exports.roleMiddleware = exports.authMiddleware = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = __importDefault(require("../config/config"));
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(`authHeader 🤜 ${authHeader}`);
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Missing authorization header'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
            return;
        }
        // Try to get user ID from token
        let userId;
        try {
            // First attempt: Verify with Supabase
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (error) {
                console.error('Supabase verification error:', error);
                // If Supabase verification fails, try decoding the token manually
                const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                userId = decodedToken.sub;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token - cannot identify user'
                    });
                    return;
                }
                console.log('Using decoded user ID from token:', userId);
            }
            else {
                userId = data.user.id;
            }
        }
        catch (tokenError) {
            console.error('Token processing error:', tokenError);
            res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
            return;
        }
        // Get user from database
        const user = await config_1.default.user.findUnique({
            where: { id: userId }
        });
        console.log(`userId 👊 ${userId}`);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};
exports.authMiddleware = authMiddleware;
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        try {
            // Ensure user exists (auth middleware should run first)
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            if (!allowedRoles.includes(req.user.role)) {
                res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during role verification'
            });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
exports.teacherMiddleware = (0, exports.roleMiddleware)(['TEACHER', 'ADMIN']);
exports.adminMiddleware = (0, exports.roleMiddleware)('ADMIN');
exports.studentMiddleware = (0, exports.roleMiddleware)(['STUDENT', 'TEACHER', 'ADMIN']);
