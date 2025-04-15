import { Request, Response } from 'express';
/**
 * Create a new group
 */
export declare const createGroupController: (req: Request, res: Response) => Promise<void>;
/**
 * Get groups for the current user
 */
export declare const getUserGroupsController: (req: Request, res: Response) => Promise<void>;
/**
 * Get a group by ID
 */
export declare const getGroupByIdController: (req: Request, res: Response) => Promise<void>;
/**
 * Update a group
 */
export declare const updateGroupController: (req: Request, res: Response) => Promise<void>;
/**
 * Delete a group
 */
export declare const deleteGroupController: (req: Request, res: Response) => Promise<void>;
/**
 * Join a group with token
 */
export declare const joinGroupController: (req: Request, res: Response) => Promise<void>;
/**
 * Get members of a group
 */
export declare const getGroupMembersController: (req: Request, res: Response) => Promise<void>;
/**
 * Add a member to a group
 */
export declare const addGroupMemberController: (req: Request, res: Response) => Promise<void>;
/**
 * Remove a member from a group
 */
export declare const removeGroupMemberController: (req: Request, res: Response) => Promise<void>;
/**
 * Refresh a group's join token
 */
export declare const refreshGroupTokenController: (req: Request, res: Response) => Promise<void>;
