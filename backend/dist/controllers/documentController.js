"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = exports.analyzeDocument = exports.getDocumentVersions = exports.updateDocument = exports.getDocument = exports.createDocument = exports.listDocuments = exports.checkDocumentAccess = void 0;
const config_1 = __importDefault(require("../config/config"));
const fs_1 = require("fs");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const checkDocumentAccess = async (userId, documentId) => {
    const document = await config_1.default.document.findUnique({
        where: { id: documentId },
        include: { group: true },
    });
    if (!document)
        return false;
    if (document.userId === userId)
        return true;
    if (document.groupId) {
        const group = await config_1.default.group.findFirst({
            where: {
                id: document.groupId,
                OR: [{ adminId: userId }, { members: { some: { userId } } }],
            },
        });
        return !!group;
    }
    return false;
};
exports.checkDocumentAccess = checkDocumentAccess;
const listDocuments = async (req, res) => {
    try {
        const documents = await config_1.default.document.findMany({
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
};
exports.listDocuments = listDocuments;
const createDocument = async (req, res) => {
    try {
        const { title, content, groupId } = req.body;
        if (groupId) {
            const group = await config_1.default.group.findFirst({
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
        const newDocument = await config_1.default.document.create({
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
};
exports.createDocument = createDocument;
const getDocument = async (req, res) => {
    try {
        const document = await config_1.default.document.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, name: true } },
                group: { select: { id: true, name: true } },
            },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            // req.user.role !== "TEACHER" &&
            !(await (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        res.status(200).json({ document });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDocument = getDocument;
const updateDocument = async (req, res) => {
    try {
        const { title, content } = req.body;
        const documentId = req.params.id;
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: "Document ID is required",
            });
        }
        const existingDocument = await config_1.default.document.findUnique({
            where: { id: documentId },
        });
        if (!existingDocument) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
            });
        }
        // Check permissions
        if (existingDocument.userId !== req.user.id &&
            req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                error: "Unauthorized to update this document",
            });
        }
        const newVersion = await config_1.default.$transaction([
            config_1.default.document.update({
                where: { id: documentId },
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
                    fileSize: content
                        ? Buffer.from(content).length
                        : existingDocument.fileSize,
                },
            }),
        ]);
        res.status(200).json({
            success: true,
            document: newVersion[1],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.updateDocument = updateDocument;
const getDocumentVersions = async (req, res) => {
    try {
        const document = await config_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            // req.user.role !== "TEACHER" &&
            !(await (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const versions = await config_1.default.document.findMany({
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
};
exports.getDocumentVersions = getDocumentVersions;
const analyzeDocument = async (req, res) => {
    try {
        const document = await config_1.default.document.findUnique({
            where: { id: req.params.id },
        });
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (req.user.role !== "ADMIN" &&
            !(await (0, exports.checkDocumentAccess)(req.user.id, req.params.id))) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const analysis = await config_1.default.feedback.findMany({
            where: { documentId: req.params.id },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.analyzeDocument = analyzeDocument;
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded",
            });
        }
        // Only allow students to upload
        if (req.user.role !== "STUDENT") {
            return res.status(403).json({
                success: false,
                error: "Only students can upload documents",
            });
        }
        const { groupId, title } = req.body;
        const file = req.file;
        // Validate file
        if (!file.mimetype.match(/(text|application|image)\/(plain|pdf|doc|docx|msword|jpeg|png|jpg)/)) {
            return res.status(400).json({
                success: false,
                error: "Invalid file type",
            });
        }
        // Extract text from PDF if file is PDF
        let content = "";
        if (file.mimetype === "application/pdf") {
            try {
                // Read file asynchronously
                const dataBuffer = await fs_1.promises.readFile(file.path);
                const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
                content = pdfData.text;
                if (!content || content.trim() === "") {
                    return res.status(400).json({
                        success: false,
                        error: "Could not extract text from PDF. The file might be scanned or protected.",
                    });
                }
            }
            catch (error) {
                console.error("PDF parsing error:", error);
                return res.status(400).json({
                    success: false,
                    error: `Failed to parse PDF: ${error.message}`,
                });
            }
        }
        // Check group access if groupId is provided
        if (groupId) {
            const group = await config_1.default.group.findFirst({
                where: {
                    id: groupId,
                    members: {
                        some: {
                            userId: req.user.id,
                        },
                    },
                },
            });
            if (!group) {
                return res.status(403).json({
                    success: false,
                    error: "You must be a member of this group to upload documents",
                });
            }
        }
        // Create the document
        const newDocument = await config_1.default.document.create({
            data: {
                title: title || file.originalname,
                content: content,
                groupId: groupId || null,
                userId: req.user.id,
                versionNumber: 1,
                isLatest: true,
                fileName: file.originalname,
                fileUrl: file.path,
                fileType: file.mimetype,
                fileSize: file.size,
            },
        });
        res.status(201).json({
            success: true,
            document: newDocument,
        });
    }
    catch (error) {
        console.error("Document upload error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.uploadDocument = uploadDocument;
