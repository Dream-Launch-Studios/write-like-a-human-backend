import { Group, PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import {
    CreateGroupData,
    UpdateGroupData,
    GroupWithMemberCount,
    GroupWithAdmin,
    GroupMemberWithUser
} from '../types/group.types';

const prisma = new PrismaClient();

/**
 * Generate a unique join token
 */
const generateJoinToken = (): string => {
    return randomBytes(16).toString('hex');
};

/**
 * Create a new group
 */
export const createGroup = async (data: CreateGroupData): Promise<Group> => {
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

/**
 * Get groups for a user
 */
export const getUserGroups = async (userId: string): Promise<GroupWithMemberCount[]> => {
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

    return groups.map(group => ({
        ...group,
        memberCount: group._count.members,
    }));
};

/**
 * Get a group by ID
 */
export const getGroupById = async (id: string): Promise<GroupWithAdmin | null> => {
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


    return {
        ...group,
        memberCount: group._count.members,
    };
};

/**
 * Get a group by join token
 */
export const getGroupByToken = async (token: string): Promise<Group | null> => {
    const group = await prisma.group.findUnique({
        where: {
            joinToken: token,
        },
    });

    return group;
};

/**
 * Update a group
 */
export const updateGroup = async (id: string, data: UpdateGroupData): Promise<Group | null> => {
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
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Delete a group
 */
export const deleteGroup = async (id: string): Promise<boolean> => {
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
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return false;
        }
        throw error;
    }
};

/**
 * Check if a user is a member of a group
 */
export const isUserInGroup = async (userId: string, groupId: string): Promise<boolean> => {
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

/**
 * Join a group with token
 */
export const joinGroupWithToken = async (userId: string, token: string): Promise<Group | null> => {
    const group = await getGroupByToken(token);

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

/**
 * Get members of a group
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMemberWithUser[]> => {
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

/**
 * Add a member to a group by email
 */
export const addGroupMemberByEmail = async (groupId: string, email: string): Promise<{ success: boolean; member?: GroupMemberWithUser; error?: string }> => {
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

/**
 * Remove a member from a group
 */
export const removeGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
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
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return false;
        }
        throw error;
    }
};

/**
 * Refresh a group's join token
 */
export const refreshGroupToken = async (groupId: string): Promise<string | null> => {
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
    } catch (error) {
        console.error('Error refreshing group token:', error);
        return null;
    }
};