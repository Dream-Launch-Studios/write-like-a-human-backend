"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshGroupToken = exports.removeGroupMember = exports.addGroupMemberByEmail = exports.getGroupMembers = exports.joinGroupWithToken = exports.isUserInGroup = exports.deleteGroup = exports.updateGroup = exports.getGroupByToken = exports.getGroupById = exports.getUserGroups = exports.createGroup = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
/**
 * Generate a unique join token
 */
const generateJoinToken = () => {
    return (0, crypto_1.randomBytes)(16).toString('hex');
};
/**
 * Create a new group
 */
const createGroup = async (data) => {
    const joinToken = generateJoinToken();
    const group = await prisma.group.create({
        data: {
            name: data.name,
            description: data.description,
            adminId: data.adminId,
            joinToken,
        },
    });
    // Add the creator as a member
    await prisma.groupMember.create({
        data: {
            userId: data.adminId,
            groupId: group.id,
        },
    });
    return group;
};
exports.createGroup = createGroup;
/**
 * Get groups for a user
 */
const getUserGroups = async (userId) => {
    // Find all groups where the user is a member
    const userGroups = await prisma.groupMember.findMany({
        where: {
            userId,
        },
        select: {
            groupId: true,
        },
    });
    const groupIds = userGroups.map(group => group.groupId);
    if (groupIds.length === 0) {
        return [];
    }
    // Get the groups with member count
    const groups = await prisma.group.findMany({
        where: {
            id: {
                in: groupIds,
            },
        },
        include: {
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });
    return groups.map(group => (Object.assign(Object.assign({}, group), { memberCount: group._count.members })));
};
exports.getUserGroups = getUserGroups;
/**
 * Get a group by ID
 */
const getGroupById = async (id) => {
    const group = await prisma.group.findUnique({
        where: {
            id,
        },
        include: {
            admin: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });
    if (!group) {
        return null;
    }
    return Object.assign(Object.assign({}, group), { memberCount: group._count.members });
};
exports.getGroupById = getGroupById;
/**
 * Get a group by join token
 */
const getGroupByToken = async (token) => {
    const group = await prisma.group.findUnique({
        where: {
            joinToken: token,
        },
    });
    return group;
};
exports.getGroupByToken = getGroupByToken;
/**
 * Update a group
 */
const updateGroup = async (id, data) => {
    try {
        const updatedGroup = await prisma.group.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                description: data.description,
            },
        });
        return updatedGroup;
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateGroup = updateGroup;
/**
 * Delete a group
 */
const deleteGroup = async (id) => {
    try {
        // Delete all group members first
        await prisma.groupMember.deleteMany({
            where: {
                groupId: id,
            },
        });
        // Then delete the group
        await prisma.group.delete({
            where: {
                id,
            },
        });
        return true;
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return false;
        }
        throw error;
    }
};
exports.deleteGroup = deleteGroup;
/**
 * Check if a user is a member of a group
 */
const isUserInGroup = async (userId, groupId) => {
    const membership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId,
            },
        },
    });
    return !!membership;
};
exports.isUserInGroup = isUserInGroup;
/**
 * Join a group with token
 */
const joinGroupWithToken = async (userId, token) => {
    const group = await (0, exports.getGroupByToken)(token);
    if (!group) {
        return null;
    }
    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId: group.id,
            },
        },
    });
    if (existingMembership) {
        // User is already a member, just return the group
        return group;
    }
    // Add user to the group
    await prisma.groupMember.create({
        data: {
            userId,
            groupId: group.id,
        },
    });
    return group;
};
exports.joinGroupWithToken = joinGroupWithToken;
/**
 * Get members of a group
 */
const getGroupMembers = async (groupId) => {
    const members = await prisma.groupMember.findMany({
        where: {
            groupId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            joinedAt: 'asc',
        },
    });
    return members;
};
exports.getGroupMembers = getGroupMembers;
/**
 * Add a member to a group by email
 */
const addGroupMemberByEmail = async (groupId, email) => {
    // Find the user by email
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return {
            success: false,
            error: 'User not found with this email',
        };
    }
    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId: user.id,
                groupId,
            },
        },
    });
    if (existingMembership) {
        return {
            success: false,
            error: 'User is already a member of this group',
        };
    }
    // Add user to the group
    const member = await prisma.groupMember.create({
        data: {
            userId: user.id,
            groupId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    return {
        success: true,
        member,
    };
};
exports.addGroupMemberByEmail = addGroupMemberByEmail;
/**
 * Remove a member from a group
 */
const removeGroupMember = async (groupId, userId) => {
    try {
        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });
        return true;
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return false;
        }
        throw error;
    }
};
exports.removeGroupMember = removeGroupMember;
/**
 * Refresh a group's join token
 */
const refreshGroupToken = async (groupId) => {
    try {
        const newToken = generateJoinToken();
        await prisma.group.update({
            where: {
                id: groupId,
            },
            data: {
                joinToken: newToken,
            },
        });
        return newToken;
    }
    catch (error) {
        console.error('Error refreshing group token:', error);
        return null;
    }
};
exports.refreshGroupToken = refreshGroupToken;
