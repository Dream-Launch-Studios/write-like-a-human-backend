import { UserRole } from '@prisma/client';

/**
 * Interface for user filtering parameters
 */
export interface UserFilter {
    page?: number;
    limit?: number;
    role?: UserRole;
}