"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinGroupWithToken = exports.getGroupDocuments = exports.removeGroupMember = exports.addGroupMember = exports.listGroupMembers = exports.deleteGroup = exports.updateGroup = exports.getGroupDetails = exports.listGroups = exports.createGroup = void 0;
const config_1 = __importDefault(require("../config/config"));
// Helper functions
const generateUniqueToken = () => {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
};
const checkGroupMembership = async (userId, groupId) => {
    const group = await config_1.default.group.findFirst({
        where: {
            id: groupId,
            OR: [{ adminId: userId }, { members: { some: { userId } } }],
        },
    });
    return !!group;
};
// Controllers
const createGroup = async (req, res) => {
    var _a, _b;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "TEACHER" && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "ADMIN") {
            return res.status(403).json({ error: "Only teachers can create groups" });
        }
        const { name, description } = req.body;
        const joinToken = generateUniqueToken();
        const group = await config_1.default.group.create({
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
};
exports.createGroup = createGroup;
const listGroups = async (req, res) => {
    try {
        let groups;
        if (req.user.role === "ADMIN") {
            groups = await config_1.default.group.findMany({
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
            groups = await config_1.default.group.findMany({
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
};
exports.listGroups = listGroups;
const getGroupDetails = async (req, res) => {
    try {
        const groupId = req.params.id;
        const isMember = await checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const group = (await config_1.default.group.findUnique({
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
};
exports.getGroupDetails = getGroupDetails;
const updateGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { name, description } = req.body;
        const group = await config_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to update group" });
        }
        const updatedGroup = await config_1.default.group.update({
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
};
exports.updateGroup = updateGroup;
const deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await config_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to delete group" });
        }
        await config_1.default.group.delete({
            where: { id: groupId },
        });
        res.status(200).json({ message: "Group deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteGroup = deleteGroup;
const listGroupMembers = async (req, res) => {
    try {
        const groupId = req.params.id;
        const isMember = await checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const members = await config_1.default.groupMember.findMany({
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
};
exports.listGroupMembers = listGroupMembers;
const addGroupMember = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        const group = await config_1.default.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized to add members" });
        }
        const user = await config_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const existingMember = await config_1.default.groupMember.findUnique({
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
        const member = await config_1.default.groupMember.create({
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
};
exports.addGroupMember = addGroupMember;
const removeGroupMember = async (req, res) => {
    try {
        const { id: groupId, userId } = req.params;
        const group = await config_1.default.group.findUnique({
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
        await config_1.default.groupMember.delete({
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
};
exports.removeGroupMember = removeGroupMember;
const getGroupDocuments = async (req, res) => {
    try {
        const groupId = req.params.id;
        const isMember = await checkGroupMembership(req.user.id, groupId);
        if (!isMember && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const documents = await config_1.default.document.findMany({
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
};
exports.getGroupDocuments = getGroupDocuments;
const joinGroupWithToken = async (req, res) => {
    try {
        const { token } = req.params;
        const group = await config_1.default.group.findUnique({
            where: { joinToken: token },
        });
        if (!group) {
            return res.status(404).json({ error: "Invalid or expired join token" });
        }
        const existingMember = await config_1.default.groupMember.findUnique({
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
        await config_1.default.groupMember.create({
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
};
exports.joinGroupWithToken = joinGroupWithToken;
