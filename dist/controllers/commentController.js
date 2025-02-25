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
exports.deleteComment = exports.updateComment = exports.getComment = void 0;
const config_1 = __importDefault(require("../config/config"));
const documentController_1 = require("./documentController");
// Helper functions
const checkCommentOwnership = (userId, commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield config_1.default.comment.findUnique({
        where: { id: commentId },
    });
    return (comment === null || comment === void 0 ? void 0 : comment.userId) === userId;
});
// Comment Controllers
const getComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield config_1.default.comment.findUnique({
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
        if (!(yield (0, documentController_1.checkDocumentAccess)(req.user.id, comment.feedback.documentId))) {
            return res.status(403).json({ error: "No access to comment" });
        }
        res.status(200).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getComment = getComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const comment = yield config_1.default.comment.findUnique({
            where: { id: req.params.id },
        });
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        if (!(yield checkCommentOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const updatedComment = yield config_1.default.comment.update({
            where: { id: req.params.id },
            data: { content },
        });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield config_1.default.comment.findUnique({
            where: { id: req.params.id },
        });
        if (!comment)
            return res.status(404).json({ error: "Comment not found" });
        if (!(yield checkCommentOwnership(req.user.id, req.params.id)) &&
            req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        yield config_1.default.comment.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteComment = deleteComment;
