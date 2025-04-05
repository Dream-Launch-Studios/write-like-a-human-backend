import { Request, Response } from 'express';
import {
    createGroup,
    getUserGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    joinGroupWithToken,
    getGroupMembers,
    addGroupMemberByEmail,
    removeGroupMember,
    refreshGroupToken,
    isUserInGroup
} from '../services/group.service';
import { ApiResponse } from '../types/group.types';

/**
 * Create a new group
 */
export const createGroupController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        const adminId = req.user.id;

        const group = await createGroup({
            name,
            description,
            adminId,
        });

        const response: ApiResponse = {
            success: true,
            message: 'Group created successfully',
            group: {
                id: group.id,
                name: group.name,
                description: group.description,
                joinToken: group.joinToken,
                adminId: group.adminId,
                createdAt: group.createdAt,
            },
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating group:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Get groups for the current user
 */
export const getUserGroupsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;

        const groups = await getUserGroups(userId);

        const response: ApiResponse = {
            success: true,
            groups,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting user groups:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get user groups',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Get a group by ID
 */
export const getGroupByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get the group
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is a member or admin
        const isMember = await isUserInGroup(userId, id);
        const isAdmin = group?.adminId === userId;

        if (!isMember && !isAdmin && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to access this group',
            };
            res.status(403).json(response);
        }

        // remove token from group object if user is not admin or teacher
        const groupWithoutToken = { ...group, joinToken: undefined };

        if (req.user.role === "TEACHER" || req.user.role === "ADMIN") {
            const response: ApiResponse = {
                success: true,
                group,
            };

            res.status(200).json(response);
        } else {
            const response: ApiResponse = {
                success: true,
                group: groupWithoutToken,
            };
            res.status(200).json(response);

        }


    } catch (error) {
        console.error('Error getting group:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Update a group
 */
export const updateGroupController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is the admin
        if (group?.adminId !== userId && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Only group admin can update the group',
            };
            res.status(403).json(response);
        }

        const updatedGroup = await updateGroup(id, {
            name,
            description,
        });

        const response: ApiResponse = {
            success: true,
            message: 'Group updated successfully',
            group: {
                id: updatedGroup?.id,
                name: updatedGroup?.name,
                description: updatedGroup?.description,
                updatedAt: updatedGroup?.updatedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating group:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Delete a group
 */
export const deleteGroupController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is the admin
        if (group?.adminId !== userId && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Only group admin can delete the group',
            };
            res.status(403).json(response);
        }

        const deleted = await deleteGroup(id);

        if (!deleted) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Group deleted successfully',
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting group:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Join a group with token
 */
export const joinGroupController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const userId = req.user.id;

        const group = await joinGroupWithToken(userId, token);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Invalid or expired join token',
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Joined group successfully',
            group: {
                id: group?.id,
                name: group?.name,
                description: group?.description,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error joining group:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to join group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Get members of a group
 */
export const getGroupMembersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is a member or admin
        const isMember = await isUserInGroup(userId, id);
        const isAdmin = group?.adminId === userId;

        if (!isMember && !isAdmin && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to access this group',
            };
            res.status(403).json(response);
        }

        const members = await getGroupMembers(id);

        const response: ApiResponse = {
            success: true,
            members,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting group members:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get group members',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Add a member to a group
 */
export const addGroupMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is the admin
        if (group?.adminId !== userId && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Only group admin can add members',
            };
            res.status(403).json(response);
        }

        const result = await addGroupMemberByEmail(id, email);

        if (!result.success) {
            const response: ApiResponse = {
                success: false,
                message: result.error || 'Failed to add member',
            };
            res.status(400).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Member added successfully',
            member: result.member,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error adding group member:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to add group member',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Remove a member from a group
 */
export const removeGroupMemberController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, userId: targetUserId } = req.params;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is the admin or the member removing themselves
        const isSelfRemoval = userId === targetUserId;
        const isAdmin = group?.adminId === userId;

        if (!isSelfRemoval && !isAdmin && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized to remove this member',
            };
            res.status(403).json(response);
        }

        // Prevent removal of the admin
        if (targetUserId === group?.adminId && !isSelfRemoval && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Cannot remove the group admin',
            };
            res.status(400).json(response);
        }

        const removed = await removeGroupMember(id, targetUserId);

        if (!removed) {
            const response: ApiResponse = {
                success: false,
                message: 'Member not found in this group',
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Member removed from group',
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error removing group member:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to remove group member',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Refresh a group's join token
 */
export const refreshGroupTokenController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if group exists
        const group = await getGroupById(id);

        if (!group) {
            const response: ApiResponse = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }

        // Check if user is the admin
        if (group?.adminId !== userId && req.user.role !== 'ADMIN') {
            const response: ApiResponse = {
                success: false,
                message: 'Only group admin can refresh the join token',
            };
            res.status(403).json(response);
        }

        const newToken = await refreshGroupToken(id);

        if (!newToken) {
            const response: ApiResponse = {
                success: false,
                message: 'Failed to refresh join token',
            };
            res.status(500).json(response);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Join token refreshed successfully',
            joinToken: newToken,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error refreshing group token:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to refresh group token',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};