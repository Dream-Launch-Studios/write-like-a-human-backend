"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.updateUserRole = exports.getUserById = exports.getUsers = void 0;
const userService = __importStar(require("../services/user.service"));
/**
 * Get list of users with pagination and filtering
 */
const getUsers = async (req, res) => {
    try {
        // Query parameters are already validated by middleware
        const { page = 1, limit = 10, role } = req.query;
        // Get users from service
        const { users, pagination } = await userService.getUsers({
            page: Number(page),
            limit: Number(limit),
            role: role
        });
        const response = {
            success: true,
            users,
            pagination
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting users:', error);
        const response = {
            success: false,
            message: 'Failed to get users',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getUsers = getUsers;
/**
 * Get a specific user by ID
 */
const getUserById = async (req, res) => {
    try {
        // ID is already validated by middleware
        const { id } = req.params;
        // Check authorization - users can only view themselves unless admin    
        if (req.user.role !== 'ADMIN' && req.user.id !== id) {
            const response = {
                success: false,
                message: 'Unauthorized access to user information'
            };
            res.status(403).json(response);
            return;
        }
        // Get user from service
        const user = await userService.getUserById(id);
        if (!user) {
            const response = {
                success: false,
                message: 'User not found'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            user
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting user by ID:', error);
        const response = {
            success: false,
            message: 'Failed to get user',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getUserById = getUserById;
/**
 * Update a user's role (admin only)
 */
const updateUserRole = async (req, res) => {
    try {
        // ID and role are already validated by middleware
        const { id } = req.params;
        const { role } = req.body;
        // Update user in service
        const updatedUser = await userService.updateUserRole(id, role);
        if (!updatedUser) {
            const response = {
                success: false,
                message: 'User not found'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            message: 'User role updated successfully',
            user: updatedUser
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating user role:', error);
        const response = {
            success: false,
            message: 'Failed to update user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.updateUserRole = updateUserRole;
/**
 * Get dashboard stats for the authenticated user
 */
const getDashboardStats = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            const response = {
                success: false,
                message: 'User not authenticated'
            };
            res.status(401).json(response);
            return;
        }
        const stats = await userService.getDashboardStats(userId);
        const response = {
            success: true,
            stats
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting dashboard stats:', error);
        const response = {
            success: false,
            message: 'Failed to get dashboard stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getDashboardStats = getDashboardStats;
