"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserInGroup = exports.getDocumentVersions = exports.createDocumentVersion = exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.listDocuments = exports.createDocument = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create a new document
 */
const createDocument = async (data) => {
    return await prisma.$transaction(async (tx) => {
        const document = await tx.document.create({
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
                createdWith: data.createdWith,
                isLatest: true,
                contentFormat: data.contentFormat
            }
        });
        await tx.documentVersion.create({
            data: {
                rootDocumentId: document.id,
                versionedDocId: document.id,
                versionNumber: 1,
            }
        });
        return document;
    });
};
exports.createDocument = createDocument;
/**
 * List documents with pagination and filtering
 */
const listDocuments = async ({ userId, page = 1, limit = 10, groupId, search }) => {
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
    if (search && search.trim() !== '') {
        where.title = {
            contains: search,
            mode: 'insensitive'
        };
    }
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
            rootDocumentId: true,
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
 * Helper function to delete a single document with no version handling
 */
const deleteDocumentById = async (id) => {
    await prisma.$transaction([
        // Delete any word suggestions
        prisma.wordSuggestion.deleteMany({
            where: { documentId: id }
        }),
        // Delete any comments
        prisma.comment.deleteMany({
            where: { documentId: id }
        }),
        // Delete any feedback
        prisma.feedback.deleteMany({
            where: { documentId: id }
        }),
        // Delete any AI analysis and related data
        prisma.documentSection.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: id
                }
            }
        }),
        prisma.textMetrics.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: id
                }
            }
        }),
        prisma.aIAnalysis.deleteMany({
            where: { documentId: id }
        }),
        // Delete submissions
        prisma.submission.deleteMany({
            where: { documentId: id }
        }),
        // Finally, delete the document
        prisma.document.delete({
            where: { id }
        })
    ]);
    return true;
};
const deleteDocument = async (id) => {
    // First, find the root document ID
    const documentVersion = await prisma.documentVersion.findFirst({
        where: {
            OR: [
                { rootDocumentId: id },
                { versionedDocId: id }
            ]
        }
    });
    if (!documentVersion) {
        // If no version entry exists, just delete the document
        return await deleteDocumentById(id);
    }
    // Get the root document ID
    const rootDocumentId = documentVersion.rootDocumentId;
    // Get all versions of this document
    const allVersions = await prisma.documentVersion.findMany({
        where: { rootDocumentId },
        select: { versionedDocId: true }
    });
    const versionIds = allVersions.map(v => v.versionedDocId);
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
        // Delete all version mappings
        prisma.documentVersion.deleteMany({
            where: { rootDocumentId }
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
// export const createDocumentVersion = async (data: CreateVersionData) => {
//     // Get parent document to determine version number
//     const parentDocument = await prisma.document.findUnique({
//         where: { id: data.parentDocumentId }
//     });
//     if (!parentDocument) {
//         throw new Error('Parent document not found');
//     }
//     // Start a transaction to update the parent and create the new version
//     return await prisma.$transaction(async (tx) => {
//         // 1. Set all previous versions (including parent) to not be the latest
//         await tx.document.updateMany({
//             where: {
//                 OR: [   
//                     { id: data.parentDocumentId },
//                     { parentDocumentId: data.parentDocumentId }
//                 ]
//             },
//             data: {
//                 isLatest: false
//             }
//         });
//         // 2. Create the new version
//         const newVersion = await tx.document.create({
//             data: {
//                 title: data.title,
//                 content: data.content,
//                 fileName: data.fileName,
//                 fileUrl: data.fileUrl,
//                 fileType: data.fileType,
//                 fileSize: data.fileSize,
//                 userId: data.userId,
//                 groupId: data.groupId,
//                 parentDocumentId: data.parentDocumentId,
//                 versionNumber: parentDocument.versionNumber + 1,
//                 isLatest: true
//             }
//         });
//         return newVersion;
//     });
// };
/**
 * Create a new version of a document
 */
const createDocumentVersion = async (data) => {
    // First, find the version entry for the document being versioned
    const versionEntry = await prisma.documentVersion.findFirst({
        where: { versionedDocId: data.parentDocumentId }
    });
    if (!versionEntry) {
        throw new Error('Document not found or not properly versioned');
    }
    // Get the root document ID
    const rootDocumentId = versionEntry.rootDocumentId;
    // Find the highest version number for this root document
    const highestVersion = await prisma.documentVersion.findFirst({
        where: { rootDocumentId },
        orderBy: { versionNumber: 'desc' }
    });
    if (!highestVersion) {
        throw new Error('Could not determine version number');
    }
    const nextVersionNumber = highestVersion.versionNumber + 1;
    return await prisma.$transaction(async (tx) => {
        await tx.document.updateMany({
            where: {
                id: {
                    in: (await tx.documentVersion.findMany({
                        where: { rootDocumentId },
                        select: { versionedDocId: true }
                    })).map(v => v.versionedDocId)
                }
            },
            data: {
                isLatest: false
            }
        });
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
                versionNumber: nextVersionNumber,
                isLatest: true,
                rootDocumentId
            }
        });
        await tx.documentVersion.create({
            data: {
                rootDocumentId,
                versionedDocId: newVersion.id,
                versionNumber: nextVersionNumber
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
    // Find the root document ID for this document
    const versionEntry = await prisma.documentVersion.findFirst({
        where: {
            OR: [
                { rootDocumentId: documentId },
                { versionedDocId: documentId }
            ]
        }
    });
    if (!versionEntry) {
        throw new Error('Document not found or not properly versioned');
    }
    const rootDocumentId = versionEntry.rootDocumentId;
    // Get all versions for this root document
    const allVersionEntries = await prisma.documentVersion.findMany({
        where: { rootDocumentId },
        include: {
            versionedDoc: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    userId: true,
                    isLatest: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            versionNumber: 'desc'
        }
    });
    // Format the version data
    return allVersionEntries.map(entry => ({
        id: entry.versionedDoc.id,
        title: entry.versionedDoc.title,
        versionNumber: entry.versionNumber,
        isLatest: entry.versionedDoc.isLatest,
        createdAt: entry.versionedDoc.createdAt,
        userId: entry.versionedDoc.userId,
        user: entry.versionedDoc.user
    }));
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
