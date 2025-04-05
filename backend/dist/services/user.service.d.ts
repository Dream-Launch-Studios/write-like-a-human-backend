import { UserRole } from '@prisma/client';
import { UserFilter } from '../types/user.type';
/**
 * Get a list of users with pagination and optional filters
 */
export declare const getUsers: ({ page, limit, role }: UserFilter) => Promise<{
    users: {
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        isEmailVerified: boolean;
        createdAt: Date;
    }[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
/**
 * Get a specific user by ID
 */
export declare const getUserById: (id: string) => Promise<{
    email: string;
    name: string | null;
    role: import(".prisma/client").$Enums.UserRole;
    id: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
/**
 * Update a user's role
 */
export declare const updateUserRole: (id: string, role: UserRole) => Promise<{
    email: string;
    name: string | null;
    role: import(".prisma/client").$Enums.UserRole;
    id: string;
    isEmailVerified: boolean;
} | null>;
interface DashboardStats {
    totalDocuments: number;
    totalGroups: number;
    totalSubmissions: number;
    recentDocuments: any[];
    recentGroups: any[];
}
interface DashboardStats {
    totalDocuments: number;
    totalGroups: number;
    totalSubmissions: number;
    recentDocuments: any[];
    recentGroups: any[];
}
/**
 * Get dashboard stats for a specific user
 */
export declare const getDashboardStats: (userId: string) => Promise<DashboardStats>;
export {};
