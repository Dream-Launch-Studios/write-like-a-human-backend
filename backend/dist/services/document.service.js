"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserInGroup = exports.getDocumentVersions = exports.createDocumentVersion = exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.listDocuments = exports.createDocument = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create a new document
 */
const createDocument = async (data) => {
    const document = await prisma.document.create({
        data: {
            title: data.title,
            content: data.content,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
            userId: data.userId,
            groupId: data.groupId,
            versionNumber: 1,
            isLatest: true
        }
    });
    return document;
};
exports.createDocument = createDocument;
/**
 * List documents with pagination and filtering
 */
const listDocuments = async ({ userId, page = 1, limit = 10, groupId }) => {
    // Calculate pagination
    const skip = (page - 1) * limit;
    // Build where clause based on filters
    const where = {
        OR: [
            { userId },
            groupId ? { groupId } : {}
        ],
        isLatest: true // Only show latest versions
    };
    // Get documents with pagination
    const documents = await prisma.document.findMany({
        where,
        select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            userId: true,
            groupId: true,
            versionNumber: true,
            isLatest: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            group: groupId ? {
                select: {
                    id: true,
                    name: true
                }
            } : false
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc'
        }
    });
    // Get total count for pagination
    const total = await prisma.document.count({ where });
    // Calculate pagination info
    const pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    };
    return { documents, pagination };
};
exports.listDocuments = listDocuments;
/**
 * Get a document by ID with user and group information
 */
const getDocumentById = async (id) => {
    const document = await prisma.document.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            group: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    return document;
};
exports.getDocumentById = getDocumentById;
/**
 * Update a document
 */
const updateDocument = async (id, data) => {
    const document = await prisma.document.update({
        where: { id },
        data
    });
    return document;
};
exports.updateDocument = updateDocument;
/**
 * Delete a document
 */
const deleteDocument = async (id) => {
    // First get all related versions
    const versions = await prisma.document.findMany({
        where: {
            OR: [
                { id },
                { parentDocumentId: id }
            ]
        },
        select: { id: true }
    });
    const versionIds = versions.map(v => v.id);
    // Use a transaction to delete all related data
    await prisma.$transaction([
        // Delete any word suggestions
        prisma.wordSuggestion.deleteMany({
            where: { documentId: { in: versionIds } }
        }),
        // Delete any comments
        prisma.comment.deleteMany({
            where: { documentId: { in: versionIds } }
        }),
        // Delete any feedback
        prisma.feedback.deleteMany({
            where: { documentId: { in: versionIds } }
        }),
        // Delete any AI analysis and related data
        prisma.documentSection.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: { in: versionIds }
                }
            }
        }),
        prisma.textMetrics.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: { in: versionIds }
                }
            }
        }),
        prisma.aIAnalysis.deleteMany({
            where: { documentId: { in: versionIds } }
        }),
        // Delete submissions
        prisma.submission.deleteMany({
            where: { documentId: { in: versionIds } }
        }),
        // Finally, delete all document versions
        prisma.document.deleteMany({
            where: { id: { in: versionIds } }
        })
    ]);
    return true;
};
exports.deleteDocument = deleteDocument;
/**
 * Create a new version of a document
 */
const createDocumentVersion = async (data) => {
    // Get parent document to determine version number
    const parentDocument = await prisma.document.findUnique({
        where: { id: data.parentDocumentId }
    });
    if (!parentDocument) {
        throw new Error('Parent document not found');
    }
    // Start a transaction to update the parent and create the new version
    return await prisma.$transaction(async (tx) => {
        // 1. Set all previous versions (including parent) to not be the latest
        await tx.document.updateMany({
            where: {
                OR: [
                    { id: data.parentDocumentId },
                    { parentDocumentId: data.parentDocumentId }
                ]
            },
            data: {
                isLatest: false
            }
        });
        // 2. Create the new version
        const newVersion = await tx.document.create({
            data: {
                title: data.title,
                content: data.content,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileSize: data.fileSize,
                userId: data.userId,
                groupId: data.groupId,
                parentDocumentId: data.parentDocumentId,
                versionNumber: parentDocument.versionNumber + 1,
                isLatest: true
            }
        });
        return newVersion;
    });
};
exports.createDocumentVersion = createDocumentVersion;
/**
 * Get all versions of a document
 */
const getDocumentVersions = async (documentId) => {
    // Get the original document first
    const originalDocument = await prisma.document.findUnique({
        where: { id: documentId }
    });
    if (!originalDocument) {
        throw new Error('Document not found');
    }
    // If this is already a child version, find the true parent
    const rootDocumentId = originalDocument.parentDocumentId || originalDocument.id;
    // Get all versions
    const versions = await prisma.document.findMany({
        where: {
            OR: [
                { id: rootDocumentId },
                { parentDocumentId: rootDocumentId }
            ]
        },
        select: {
            id: true,
            title: true,
            versionNumber: true,
            isLatest: true,
            createdAt: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            versionNumber: 'desc'
        }
    });
    return versions;
};
exports.getDocumentVersions = getDocumentVersions;
/**
 * Check if a user is a member of a group
 */
const isUserInGroup = async (userId, groupId) => {
    // Check if group exists
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });
    if (!group) {
        return false;
    }
    // If user is the admin of the group, they're a member
    if (group.adminId === userId) {
        return true;
    }
    // Check for group membership
    const membership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId
            }
        }
    });
    return !!membership;
};
exports.isUserInGroup = isUserInGroup;
