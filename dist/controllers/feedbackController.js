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
exports.addComment = exports.getFeedbackComments = exports.deleteFeedback = exports.updateFeedback = exports.getFeedback = exports.createFeedback = void 0;
const config_1 = __importDefault(require("../config/config"));
// Helper functions
const checkDocumentAccess = (userId, documentId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!documentId)
        return false;
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
const checkFeedbackOwnership = (userId, feedbackId) => __awaiter(void 0, void 0, void 0, function* () {
    const feedback = yield config_1.default.feedback.findUnique({
        where: { id: feedbackId },
    });
    return (feedback === null || feedback === void 0 ? void 0 : feedback.userId) === userId;
});
// Feedback Controllers
const createFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, content, status } = req.body;
        const document = yield config_1.default.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        const feedback = yield config_1.default.feedback.create({
            data: {
                content,
                status: (status || "PENDING"),
                documentId,
                userId: req.user.id,
                groupId: document.groupId,
            },
        });
        res.status(201).json(feedback);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createFeedback = createFeedback;
const getFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield config_1.default.feedback.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, name: true } },
                document: { select: { id: true, title: true } },
            },
        });
        if (!feedback || !feedback.documentId) {
            return res.status(404).json({ error: "Feedback not found" });
        }
        if (!(yield checkDocumentAccess(req.user.id, feedback.documentId))) {
            return res.status(403).json({ error: "No access to feedback" });
        }
        res.status(200).json(feedback);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFeedback = getFeedback;
const updateFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, status } = req.body;
        const feedback = yield config_1.default.feedback.findUnique({
            where: { id: req.params.id },
        });
        if (!feedback)
            return res.status(404).json({ error: "Feedback not found" });
        if (!(yield checkFeedbackOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const updatedFeedback = yield config_1.default.feedback.update({
            where: { id: req.params.id },
            data: { content, status },
        });
        res.status(200).json(updatedFeedback);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateFeedback = updateFeedback;
const deleteFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield config_1.default.feedback.findUnique({
            where: { id: req.params.id },
        });
        if (!feedback)
            return res.status(404).json({ error: "Feedback not found" });
        if (!(yield checkFeedbackOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        yield config_1.default.$transaction([
            config_1.default.comment.deleteMany({ where: { feedbackId: req.params.id } }),
            config_1.default.feedback.delete({ where: { id: req.params.id } }),
        ]);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteFeedback = deleteFeedback;
const getFeedbackComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const feedback = yield config_1.default.feedback.findUnique({
            where: { id: req.params.id },
        });
        if (!feedback)
            return res.status(404).json({ error: "Feedback not found" });
        if (!(yield checkDocumentAccess(req.user.id, feedback.documentId))) {
            return res.status(403).json({ error: "No access to comments" });
        }
        const comments = yield config_1.default.comment.findMany({
            where: { feedbackId: req.params.id },
            orderBy: { createdAt: "asc" },
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getFeedbackComments = getFeedbackComments;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const feedback = yield config_1.default.feedback.findUnique({
            where: { id: req.params.id },
            include: { document: true },
        });
        if (!feedback || !feedback.documentId) {
            return res.status(404).json({ error: "Feedback not found" });
        }
        const comment = yield config_1.default.comment.create({
            data: {
                content,
                feedbackId: req.params.id,
                userId: req.user.id,
                documentId: feedback.documentId,
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addComment = addComment;
