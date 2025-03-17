import { Group, GroupMember, User } from '@prisma/client';

/**
 * Interface for creating a group
 */
export interface CreateGroupData {
    name: string;
    description?: string | null;
    adminId: string;
}

/**
 * Interface for updating a group
 */
export interface UpdateGroupData {
    name?: string;
    description?: string | null;
}

/**
 * Interface for group with member count
 */
export interface GroupWithMemberCount extends Group {
    memberCount: number;
}

/**
 * Interface for group with admin data
 */
export interface GroupWithAdmin extends Group {
    admin: {
        id: string;
        name: string | null;
    };
    memberCount: number;
}

/**
 * Interface for group member with user data
 */
export interface GroupMemberWithUser extends GroupMember {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
}

/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    errors?: any;
    error?: string;
    [key: string]: any;
}