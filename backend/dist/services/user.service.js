"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.updateUserRole = exports.getUserById = exports.getUsers = void 0;
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
/**
 * Get dashboard stats for a specific user
 */
const getDashboardStats = async (userId) => {
    // Get total documents created by the user
    const totalDocuments = await prisma.document.count({
        where: { userId }
    });
    // Get total groups joined by the user
    const totalGroups = await prisma.groupMember.count({
        where: { userId }
    });
    // Get total submissions made by the user
    const totalSubmissions = await prisma.submission.count({
        where: { userId }
    });
    // Get recent documents created by the user with distinct titles
    // First get all documents
    const allUserDocuments = await prisma.document.findMany({
        where: { userId },
        select: {
            id: true,
            title: true,
            fileName: true,
            fileType: true,
            createdAt: true,
            updatedAt: true,
            rootDocumentId: true,
            group: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Then filter for unique titles by using a Map to track seen titles
    const uniqueDocTitles = new Map();
    const recentDocuments = allUserDocuments
        .filter(doc => {
        // If we haven't seen this title before, add it to our map and keep this document
        if (!uniqueDocTitles.has(doc.title)) {
            uniqueDocTitles.set(doc.title, true);
            return true;
        }
        return false;
    })
        .slice(0, 5); // Take only the first 5 after filtering
    // Get recent groups joined by the user
    const recentGroups = await prisma.groupMember.findMany({
        where: { userId },
        select: {
            joinedAt: true,
            group: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    admin: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            members: true
                        }
                    }
                }
            }
        },
        orderBy: {
            joinedAt: 'desc'
        },
        take: 5
    });
    return {
        totalDocuments,
        totalGroups,
        totalSubmissions,
        recentDocuments,
        recentGroups: recentGroups.map(membership => (Object.assign(Object.assign({}, membership.group), { joinedAt: membership.joinedAt, memberCount: membership.group._count.members })))
    };
};
exports.getDashboardStats = getDashboardStats;
