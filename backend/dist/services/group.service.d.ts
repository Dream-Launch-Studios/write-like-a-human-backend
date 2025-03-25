import { Group } from '@prisma/client';
import { CreateGroupData, UpdateGroupData, GroupWithMemberCount, GroupWithAdmin, GroupMemberWithUser } from '../types/group.types';
/**
 * Create a new group
 */
export declare const createGroup: (data: CreateGroupData) => Promise<Group>;
/**
 * Get groups for a user
 */
export declare const getUserGroups: (userId: string) => Promise<GroupWithMemberCount[]>;
/**
 * Get a group by ID
 */
export declare const getGroupById: (id: string) => Promise<GroupWithAdmin | null>;
/**
 * Get a group by join token
 */
export declare const getGroupByToken: (token: string) => Promise<Group | null>;
/**
 * Update a group
 */
export declare const updateGroup: (id: string, data: UpdateGroupData) => Promise<Group | null>;
/**
 * Delete a group
 */
export declare const deleteGroup: (id: string) => Promise<boolean>;
/**
 * Check if a user is a member of a group
 */
export declare const isUserInGroup: (userId: string, groupId: string) => Promise<boolean>;
/**
 * Join a group with token
 */
export declare const joinGroupWithToken: (userId: string, token: string) => Promise<Group | null>;
/**
 * Get members of a group
 */
export declare const getGroupMembers: (groupId: string) => Promise<GroupMemberWithUser[]>;
/**
 * Add a member to a group by email
 */
export declare const addGroupMemberByEmail: (groupId: string, email: string) => Promise<{
    success: boolean;
    member?: GroupMemberWithUser;
    error?: string;
}>;
/**
 * Remove a member from a group
 */
export declare const removeGroupMember: (groupId: string, userId: string) => Promise<boolean>;
/**
 * Refresh a group's join token
 */
export declare const refreshGroupToken: (groupId: string) => Promise<string | null>;
