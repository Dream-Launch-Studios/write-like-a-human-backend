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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDocument = exports.getDocumentVersions = exports.updateDocument = exports.getDocument = exports.createDocument = exports.listDocuments = exports.checkDocumentAccess = void 0;
const config_1 = __importDefault(require("../config/config"));
const checkDocumentAccess = (userId, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield config_1.default.document.findUnique({
        where: { id: documentId },
        include: { group: true },
    });
    if (!document)
        return false;
    if (document.userId === userId)
        return true;
    if (document.groupId) {
        const group = yield config_1.default.group.findFirst({
            where: {
                id: document.groupId,
                OR: [{ adminId: userId }, { members: { some: { userId } } }],
            },
        });
        return !!group;
    }
    return false;
});
exports.checkDocumentAccess = checkDocumentAccess;
const listDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const documents = yield config_1.default.document.findMany({
            where: {
                userId: req.user.id,
                isLatest: true,
            },
            include: {
                group: { select: { id: true, name: true } },
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ documents });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listDocuments = listDocuments;
const createDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, groupId } = req.body;
        if (groupId) {
            const group = yield config_1.default.group.findFirst({
                where: {
                    id: groupId,
                    OR: [
                        { adminId: req.user.id },
                        { members: { some: { userId: req.user.id } } },
                    ],
                },
            });
            if (!group && req.user.role !== "ADMIN") {
                return res
                    .status(403)
                    .json({ error: "Unauthorized to create document in this group" });
            }
        }
        const newDocument = yield config_1.default.document.create({
            data: {
                title,
                content,
                groupId: groupId || null,
                userId: req.user.id,
                versionNumber: 1,
                isLatest: true,
                fileName: title,
                fileUrl: "",
                fileType: "text",
                fileSize: Buffer.from(content).length,
            },
        });
        res.status(201).json({ document: newDocument });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createDocument = createDocument;
const getDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield config_1.default.document.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, name: true } },
                group: { select: { id: true, name: true } },
            },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            !(yield (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        res.status(200).json({ document });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDocument = getDocument;
const updateDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        const existingDocument = yield config_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!existingDocument)
            return res.status(404).json({ error: "Document not found" });
        let canEdit = false;
        if (req.user.role === "ADMIN")
            canEdit = true;
        else if (existingDocument.userId === req.user.id)
            canEdit = true;
        else if (existingDocument.groupId) {
            const group = yield config_1.default.group.findUnique({
                where: { id: existingDocument.groupId },
            });
            if ((group === null || group === void 0 ? void 0 : group.adminId) === req.user.id)
                canEdit = true;
        }
        if (!canEdit)
            return res.status(403).json({ error: "Unauthorized to edit document" });
        const newVersion = yield config_1.default.$transaction([
            config_1.default.document.update({
                where: { id: req.params.id },
                data: { isLatest: false },
            }),
            config_1.default.document.create({
                data: {
                    title: title || existingDocument.title,
                    content: content || existingDocument.content,
                    userId: req.user.id,
                    groupId: existingDocument.groupId,
                    versionNumber: existingDocument.versionNumber + 1,
                    isLatest: true,
                    parentDocumentId: existingDocument.parentDocumentId || existingDocument.id,
                    fileName: title || existingDocument.fileName,
                    fileUrl: existingDocument.fileUrl,
                    fileType: existingDocument.fileType,
                    fileSize: Buffer.from(content || existingDocument.content).length,
                },
            }),
        ]);
        res.status(200).json({ document: newVersion[1] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateDocument = updateDocument;
const getDocumentVersions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield config_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            !(yield (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const versions = yield config_1.default.document.findMany({
            where: {
                OR: [
                    { parentDocumentId: document.parentDocumentId || document.id },
                    { id: document.parentDocumentId || document.id },
                ],
            },
            orderBy: { versionNumber: "asc" },
        });
        res.status(200).json({ versions });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDocumentVersions = getDocumentVersions;
const analyzeDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield config_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            !(yield (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const analysis = yield config_1.default.feedback.findMany({
            where: { documentId: req.params.id },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.analyzeDocument = analyzeDocument;
