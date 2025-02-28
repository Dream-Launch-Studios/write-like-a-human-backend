"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDocuments = exports.updateUser = exports.getUser = void 0;
const config_1 = __importDefault(require("../config/config"));
const getUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }
        const userId = req.params.id;
        const user = req.user;
        console.log("🛠 Debug: req.user.id Type:", typeof user.id);
        console.log("🛠 Debug: userId Type:", typeof userId);
        console.log("🛠 Debug: req.user.id Value:", user.id);
        console.log("🛠 Debug: userId Value:", userId);
        if (user.id !== userId && user.role === "STUDENT") {
            if (String(user.id) !== String(userId) && user.role === "STUDENT") {
                console.log(`❌ Unauthorized: User ${user.id} tried to access ${userId}`);
                return res.status(403).json({ error: "Unauthorized access" });
            }
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const userData = await config_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user: userData });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    var _a, _b;
    try {
        const userId = req.params.id;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const { name, email } = req.body;
        const updatedUser = await config_1.default.user.update({
            where: { id: userId },
            data: { name, email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUser = updateUser;
const getUserDocuments = async (req, res) => {
    var _a, _b;
    try {
        const userId = req.params.id;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "STUDENT") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const documents = await config_1.default.document.findMany({
            where: {
                userId,
                isLatest: true,
            },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
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
exports.getUserDocuments = getUserDocuments;
