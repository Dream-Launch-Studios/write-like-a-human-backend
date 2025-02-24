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
exports.getUserDocuments = exports.updateUser = exports.getUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.params.id;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "STUDENT") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.params.id;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const { name, email } = req.body;
        const updatedUser = yield prisma.user.update({
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
});
exports.updateUser = updateUser;
const getUserDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.params.id;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "STUDENT") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const documents = yield prisma.document.findMany({
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
});
exports.getUserDocuments = getUserDocuments;
