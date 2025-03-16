import { PrismaClient, UserRole } from '@prisma/client';
import { UserFilter } from '../types/user.type';

const prisma = new PrismaClient();

/**
 * Get a list of users with pagination and optional filters
 */
export const getUsers = async ({
    page = 1,
    limit = 10,
    role
}: UserFilter) => {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where = role ? { role } : {};

    // Get users with pagination
    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            // Don't include sensitive fields like password
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Calculate pagination info
    const pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    };

    return { users, pagination };
};

/**
 * Get a specific user by ID
 */
export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Exclude password and other sensitive fields
        }
    });

    return user;
};

/**
 * Update a user's role
 */
export const updateUserRole = async (id: string, role: UserRole) => {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isEmailVerified: true
            }
        });

        return user;
    } catch (error: any) {
        // Handle case where user doesn't exist
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};