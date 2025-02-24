"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGroupWithToken = exports.getGroupDocuments = exports.removeGroupMember = exports.addGroupMember = exports.listGroupMembers = exports.deleteGroup = exports.updateGroup = exports.getGroupDetails = exports.listGroups = exports.createGroup = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper functions
const generateUniqueToken = () => {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
};
const checkGroupMembership = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield prisma.group.findFirst({
        where: {
            id: groupId,
            OR: [{ adminId: userId }, { members: { some: { userId } } }],
        },
    });
    return !!group;
});
// Controllers
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "TEACHER" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "ADMIN") {
            return res.status(403).json({ error: "Only teachers can create groups" });
        }
        const { name, description } = req.body;
        const joinToken = generateUniqueToken();
        const group = yield prisma.group.create({
            data: {
                name,
                description,
                joinToken,
                adminId: req.user.id,
            },
        });
        res.status(201).json({
            message: "Group created successfully",
            group,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createGroup = createGroup;
const listGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let groups;
        if (req.user.role === "ADMIN") {
            groups = yield prisma.group.findMany({
                include: {
                    admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            members: true,
                            documents: true,
                        },
                    },
                },
            });
        }
        else {
            groups = yield prisma.group.findMany({
                where: {
                    OR: [
                        { adminId: req.user.id },
                        { members: { some: { userId: req.user.id } } },
                    ],
                },
                include: {
                    admin: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            members: true,
                            documents: true,
                        },
                    },
                },
            });
        }
        res.status(200).json({ groups });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listGroups = listGroups;
const getGroupDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const isMember = yield checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const group = (yield prisma.group.findUnique({
            where: { id: groupId },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        }));
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        res.status(200).json({ group });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getGroupDetails = getGroupDetails;
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const { name, description } = req.body;
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to update group" });
        }
        const updatedGroup = yield prisma.group.update({
            where: { id: groupId },
            data: { name, description },
        });
        res.status(200).json({
            message: "Group updated successfully",
            group: updatedGroup,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateGroup = updateGroup;
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to delete group" });
        }
        yield prisma.group.delete({
            where: { id: groupId },
        });
        res.status(200).json({ message: "Group deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteGroup = deleteGroup;
const listGroupMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const isMember = yield checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const members = yield prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        res.status(200).json({ members });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listGroupMembers = listGroupMembers;
const addGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to add members" });
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const existingMember = yield prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });
        if (existingMember) {
            return res.status(400).json({ error: "User already in group" });
        }
        const member = yield prisma.groupMember.create({
            data: {
                userId,
                groupId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
        res.status(201).json({
            message: "Member added successfully",
            member,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addGroupMember = addGroupMember;
const removeGroupMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: groupId, userId } = req.params;
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        // Check permissions
        const isAdmin = req.user.role === "ADMIN";
        const isSelf = req.user.id === userId;
        const isGroupAdmin = group.adminId === req.user.id;
        if (!isAdmin && !isSelf && !isGroupAdmin) {
            return res.status(403).json({ error: "Unauthorized to remove member" });
        }
        // Prevent removing group admin
        if (userId === group.adminId) {
            return res.status(400).json({ error: "Cannot remove group admin" });
        }
        yield prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId,
                },
            },
        });
        res.status(200).json({ message: "Member removed successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.removeGroupMember = removeGroupMember;
const getGroupDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = req.params.id;
        const isMember = yield checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const documents = yield prisma.document.findMany({
            where: {
                groupId,
                isLatest: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                feedbacks: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        res.status(200).json({ documents });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getGroupDocuments = getGroupDocuments;
const joinGroupWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const group = yield prisma.group.findUnique({
            where: { joinToken: token },
        });
        if (!group) {
            return res.status(404).json({ error: "Invalid or expired join token" });
        }
        const existingMember = yield prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: group.id,
                },
            },
        });
        if (existingMember) {
            return res.status(400).json({ error: "Already a member of this group" });
        }
        yield prisma.groupMember.create({
            data: {
                userId: req.user.id,
                groupId: group.id,
            },
        });
        res.status(200).json({
            message: "Successfully joined the group",
            group: {
                id: group.id,
                name: group.name,
                description: group.description,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.joinGroupWithToken = joinGroupWithToken;
