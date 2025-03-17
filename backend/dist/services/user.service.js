"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUserById = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get a list of users with pagination and optional filters
 */
const getUsers = async ({ page = 1, limit = 10, role }) => {
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
exports.getUsers = getUsers;
/**
 * Get a specific user by ID
 */
const getUserById = async (id) => {
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
exports.getUserById = getUserById;
/**
 * Update a user's role
 */
const updateUserRole = async (id, role) => {
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
    }
    catch (error) {
        // Handle case where user doesn't exist
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateUserRole = updateUserRole;
