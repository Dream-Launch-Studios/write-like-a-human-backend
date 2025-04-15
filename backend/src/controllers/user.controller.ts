import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { ApiResponse } from '../types/response';

/**
 * Get list of users with pagination and filtering
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Query parameters are already validated by middleware
        const { page = 1, limit = 10, role } = req.query;

        // Get users from service
        const { users, pagination } = await userService.getUsers({
            page: Number(page),
            limit: Number(limit),
            role: role as any
        });

        const response: ApiResponse = {
            success: true,
            users,
            pagination
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting users:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get users',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        // ID is already validated by middleware
        const { id } = req.params;

        // Check authorization - users can only view themselves unless admin    
        if (req.user.role !== 'ADMIN' && req.user.id !== id) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized access to user information'
            };
            res.status(403).json(response);
            return;
        }

        // Get user from service
        const user = await userService.getUserById(id);

        if (!user) {
            const response: ApiResponse = {
                success: false,
                message: 'User not found'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            user
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting user by ID:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get user',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Update a user's role (admin only)
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        // ID and role are already validated by middleware
        const { id } = req.params;
        const { role } = req.body;

        // Update user in service
        const updatedUser = await userService.updateUserRole(id, role);

        if (!updatedUser) {
            const response: ApiResponse = {
                success: false,
                message: 'User not found'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            message: 'User role updated successfully',
            user: updatedUser
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating user role:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


/**
 * Get dashboard stats for the authenticated user
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'User not authenticated'
            };
            res.status(401).json(response);
            return;
        }

        const stats = await userService.getDashboardStats(userId);

        const response: ApiResponse = {
            success: true,
            stats
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get dashboard stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }

};