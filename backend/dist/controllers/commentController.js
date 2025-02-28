"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getComment = void 0;
const config_1 = __importDefault(require("../config/config"));
const documentController_1 = require("./documentController");
// Helper functions
const checkCommentOwnership = async (userId, commentId) => {
    const comment = await config_1.default.comment.findUnique({
        where: { id: commentId },
    });
    return (comment === null || comment === void 0 ? void 0 : comment.userId) === userId;
};
// Comment Controllers
const getComment = async (req, res) => {
    try {
        const comment = await config_1.default.comment.findUnique({
            where: { id: req.params.id },
            include: {
                feedback: {
                    include: { document: true },
                },
            },
        });
        if (!comment || !comment.feedback || !comment.feedback.documentId) {
            return res.status(404).json({ error: "Comment not found" });
        }
        if (!(await (0, documentController_1.checkDocumentAccess)(req.user.id, comment.feedback.documentId))) {
            return res.status(403).json({ error: "No access to comment" });
        }
        res.status(200).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getComment = getComment;
const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await config_1.default.comment.findUnique({
            where: { id: req.params.id },
        });
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        if (!(await checkCommentOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const updatedComment = await config_1.default.comment.update({
            where: { id: req.params.id },
            data: { content },
        });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    try {
        const comment = await config_1.default.comment.findUnique({
            where: { id: req.params.id },
        });
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        if (!(await checkCommentOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await config_1.default.comment.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteComment = deleteComment;
