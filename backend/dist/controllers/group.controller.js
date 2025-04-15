"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshGroupTokenController = exports.removeGroupMemberController = exports.addGroupMemberController = exports.getGroupMembersController = exports.joinGroupController = exports.deleteGroupController = exports.updateGroupController = exports.getGroupByIdController = exports.getUserGroupsController = exports.createGroupController = void 0;
const group_service_1 = require("../services/group.service");
/**
 * Create a new group
 */
const createGroupController = async (req, res) => {
    try {
        const { name, description } = req.body;
        const adminId = req.user.id;
        const group = await (0, group_service_1.createGroup)({
            name,
            description,
            adminId,
        });
        const response = {
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
    }
    catch (error) {
        console.error('Error creating group:', error);
        const response = {
            success: false,
            message: 'Failed to create group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.createGroupController = createGroupController;
/**
 * Get groups for the current user
 */
const getUserGroupsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await (0, group_service_1.getUserGroups)(userId);
        const response = {
            success: true,
            groups,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting user groups:', error);
        const response = {
            success: false,
            message: 'Failed to get user groups',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getUserGroupsController = getUserGroupsController;
/**
 * Get a group by ID
 */
const getGroupByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Get the group
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is a member or admin
        const isMember = await (0, group_service_1.isUserInGroup)(userId, id);
        const isAdmin = (group === null || group === void 0 ? void 0 : group.adminId) === userId;
        if (!isMember && !isAdmin && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to access this group',
            };
            res.status(403).json(response);
        }
        // remove token from group object if user is not admin or teacher
        const groupWithoutToken = Object.assign(Object.assign({}, group), { joinToken: undefined });
        if (req.user.role === "TEACHER" || req.user.role === "ADMIN") {
            const response = {
                success: true,
                group,
            };
            res.status(200).json(response);
        }
        else {
            const response = {
                success: true,
                group: groupWithoutToken,
            };
            res.status(200).json(response);
        }
    }
    catch (error) {
        console.error('Error getting group:', error);
        const response = {
            success: false,
            message: 'Failed to get group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getGroupByIdController = getGroupByIdController;
/**
 * Update a group
 */
const updateGroupController = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the admin
        if ((group === null || group === void 0 ? void 0 : group.adminId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Only group admin can update the group',
            };
            res.status(403).json(response);
        }
        const updatedGroup = await (0, group_service_1.updateGroup)(id, {
            name,
            description,
        });
        const response = {
            success: true,
            message: 'Group updated successfully',
            group: {
                id: updatedGroup === null || updatedGroup === void 0 ? void 0 : updatedGroup.id,
                name: updatedGroup === null || updatedGroup === void 0 ? void 0 : updatedGroup.name,
                description: updatedGroup === null || updatedGroup === void 0 ? void 0 : updatedGroup.description,
                updatedAt: updatedGroup === null || updatedGroup === void 0 ? void 0 : updatedGroup.updatedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating group:', error);
        const response = {
            success: false,
            message: 'Failed to update group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.updateGroupController = updateGroupController;
/**
 * Delete a group
 */
const deleteGroupController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the admin
        if ((group === null || group === void 0 ? void 0 : group.adminId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Only group admin can delete the group',
            };
            res.status(403).json(response);
        }
        const deleted = await (0, group_service_1.deleteGroup)(id);
        if (!deleted) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Group deleted successfully',
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting group:', error);
        const response = {
            success: false,
            message: 'Failed to delete group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.deleteGroupController = deleteGroupController;
/**
 * Join a group with token
 */
const joinGroupController = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user.id;
        const group = await (0, group_service_1.joinGroupWithToken)(userId, token);
        if (!group) {
            const response = {
                success: false,
                message: 'Invalid or expired join token',
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Joined group successfully',
            group: {
                id: group === null || group === void 0 ? void 0 : group.id,
                name: group === null || group === void 0 ? void 0 : group.name,
                description: group === null || group === void 0 ? void 0 : group.description,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error joining group:', error);
        const response = {
            success: false,
            message: 'Failed to join group',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.joinGroupController = joinGroupController;
/**
 * Get members of a group
 */
const getGroupMembersController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is a member or admin
        const isMember = await (0, group_service_1.isUserInGroup)(userId, id);
        const isAdmin = (group === null || group === void 0 ? void 0 : group.adminId) === userId;
        if (!isMember && !isAdmin && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to access this group',
            };
            res.status(403).json(response);
        }
        const members = await (0, group_service_1.getGroupMembers)(id);
        const response = {
            success: true,
            members,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting group members:', error);
        const response = {
            success: false,
            message: 'Failed to get group members',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getGroupMembersController = getGroupMembersController;
/**
 * Add a member to a group
 */
const addGroupMemberController = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the admin
        if ((group === null || group === void 0 ? void 0 : group.adminId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Only group admin can add members',
            };
            res.status(403).json(response);
        }
        const result = await (0, group_service_1.addGroupMemberByEmail)(id, email);
        if (!result.success) {
            const response = {
                success: false,
                message: result.error || 'Failed to add member',
            };
            res.status(400).json(response);
        }
        const response = {
            success: true,
            message: 'Member added successfully',
            member: result.member,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error adding group member:', error);
        const response = {
            success: false,
            message: 'Failed to add group member',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.addGroupMemberController = addGroupMemberController;
/**
 * Remove a member from a group
 */
const removeGroupMemberController = async (req, res) => {
    try {
        const { id, userId: targetUserId } = req.params;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the admin or the member removing themselves
        const isSelfRemoval = userId === targetUserId;
        const isAdmin = (group === null || group === void 0 ? void 0 : group.adminId) === userId;
        if (!isSelfRemoval && !isAdmin && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Unauthorized to remove this member',
            };
            res.status(403).json(response);
        }
        // Prevent removal of the admin
        if (targetUserId === (group === null || group === void 0 ? void 0 : group.adminId) && !isSelfRemoval && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Cannot remove the group admin',
            };
            res.status(400).json(response);
        }
        const removed = await (0, group_service_1.removeGroupMember)(id, targetUserId);
        if (!removed) {
            const response = {
                success: false,
                message: 'Member not found in this group',
            };
            res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Member removed from group',
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error removing group member:', error);
        const response = {
            success: false,
            message: 'Failed to remove group member',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.removeGroupMemberController = removeGroupMemberController;
/**
 * Refresh a group's join token
 */
const refreshGroupTokenController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if group exists
        const group = await (0, group_service_1.getGroupById)(id);
        if (!group) {
            const response = {
                success: false,
                message: 'Group not found',
            };
            res.status(404).json(response);
        }
        // Check if user is the admin
        if ((group === null || group === void 0 ? void 0 : group.adminId) !== userId && req.user.role !== 'ADMIN') {
            const response = {
                success: false,
                message: 'Only group admin can refresh the join token',
            };
            res.status(403).json(response);
        }
        const newToken = await (0, group_service_1.refreshGroupToken)(id);
        if (!newToken) {
            const response = {
                success: false,
                message: 'Failed to refresh join token',
            };
            res.status(500).json(response);
        }
        const response = {
            success: true,
            message: 'Join token refreshed successfully',
            joinToken: newToken,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error refreshing group token:', error);
        const response = {
            success: false,
            message: 'Failed to refresh group token',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.refreshGroupTokenController = refreshGroupTokenController;
