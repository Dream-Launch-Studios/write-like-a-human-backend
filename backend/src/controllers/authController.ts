
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../config/config";
import { supabaseAdmin } from "../utils/supabase";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password, name, role } = req.body;

        // Validate role (optional) - allow only STUDENT or TEACHER
        const allowedRoles = ["STUDENT", "TEACHER"];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // If role is not provided, default to STUDENT
        const userRole = role || "STUDENT";

        const user = await prisma.user.create({
            data: {
                id: "",
                email,
                name,
                password: hashedPassword,
                role: userRole,
                isEmailVerified: false
            },
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user?.password ?? "");
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCurrentUser = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized: No user ID found" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * Update user details
 * @param req - Express request
 * @param res - Express response
 */
export const updateUser = async (req: Request, res: Response) => {
    console.log(`👆👆👆👆👆 Controller called: updateUser`);
    try {
        // User should already be attached by authMiddleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Extract update fields from request body
        const {
            name,
            role,
            isEmailVerified,
            userId
        } = req.body;

        console.log(`Request body:`, req.body);

        // Check if admin is trying to update another user
        if (userId && userId !== req.user.id) {
            // Only admins can update other users
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can update other users'
                });
            }

            // Admin is updating another user
            return updateUserById(userId, { name, role, isEmailVerified }, req, res);
        }

        // User is updating their own profile
        // Prepare update data
        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        // Handle email verification status
        if (isEmailVerified !== undefined) {
            // Only admins can update email verification status
            if (req.user.role === 'ADMIN') {
                updateData.isEmailVerified = Boolean(isEmailVerified);
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can update email verification status'
                });
            }
        }

        // Handle role update
        if (role !== undefined) {
            // Only admins can update roles
            if (req.user.role === 'ADMIN') {
                if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid role specified'
                    });
                }
                updateData.role = role;
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Only administrators can update user roles'
                });
            }
        }

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid update fields provided'
            });
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });

        console.log('✅ User updated:', updatedUser.id);

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('⚠️ Server error during user update:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during user update',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
/**
 * Helper function to update a user by ID (admin only)
 */
const updateUserById = async (
    userId: string,
    updates: { name?: string; role?: string; isEmailVerified?: boolean },
    req: Request,
    res: Response
) => {
    try {
        // Verify the user exists
        const userToUpdate = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'User to update not found'
            });
        }

        // Prepare update data
        const updateData: any = {};

        if (updates.name !== undefined) {
            updateData.name = updates.name;
        }

        if (updates.isEmailVerified !== undefined) {
            updateData.isEmailVerified = Boolean(updates.isEmailVerified);

            // If we're verifying email in our database, we should try to sync with Supabase
            if (updates.isEmailVerified === true) {
                try {
                    // This is an admin-only action that marks the email as confirmed in Supabase
                    // Only attempt this if we're verifying (not unverifying) the email
                    await supabaseAdmin.auth.admin.updateUserById(userId, {
                        email_confirm: true
                    });
                    console.log('✅ Email confirmed in Supabase for user:', userId);
                } catch (supabaseError) {
                    console.error('⚠️ Failed to update Supabase email verification:', supabaseError);
                    // Continue anyway - we'll update our database even if Supabase update fails
                }
            }
        }

        if (updates.role !== undefined) {
            if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(updates.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified'
                });
            }
            updateData.role = updates.role;
        }

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid update fields provided'
            });
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        console.log(`✅ Admin updated user ${userId}:`, updateData);

        return res.status(200).json({
            success: true,
            message: 'User updated successfully by administrator',
            user: updatedUser
        });
    } catch (error) {
        console.error('⚠️ Error updating user by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during user update',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Update email verification status (Admin only)
 * Dedicated endpoint for email verification
 */
export const updateEmailVerification = async (req: Request, res: Response) => {
    console.log(`👆👆👆👆👆 Controller called: updateEmailVerification`);
    try {
        // User should already be attached by authMiddleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Only admins can use this endpoint
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update email verification status'
            });
        }

        const { userId, isVerified } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (isVerified === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Verification status is required'
            });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update our database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isEmailVerified: Boolean(isVerified)
            }
        });

        // If we're verifying the email, also update Supabase
        if (isVerified) {
            try {
                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    email_confirm: true
                });
                console.log('✅ Email confirmed in Supabase for user:', userId);
            } catch (supabaseError) {
                console.error('⚠️ Failed to update Supabase email verification:', supabaseError);
                // Continue anyway - we've already updated our database
            }
        }

        return res.status(200).json({
            success: true,
            message: `Email verification ${isVerified ? 'confirmed' : 'removed'} successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error('⚠️ Server error updating email verification:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating email verification',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get user details
 * @param req - Express request
 * @param res - Express response
 */
export const getUserDetails = async (req: Request, res: Response) => {
    try {
        // User should already be attached by authMiddleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }

}
