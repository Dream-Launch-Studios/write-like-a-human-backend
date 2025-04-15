"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const comment_schema_1 = require("../schemas/comment.schema");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.post('/documents/:id/comments', (0, validate_middleware_1.validate)(comment_schema_1.createDocumentCommentSchema), comment_controller_1.createDocumentComment);
router.get('/documents/:id/comments', (0, validate_middleware_1.validate)(comment_schema_1.getDocumentCommentsSchema), comment_controller_1.getDocumentCommentsController);
router.patch('/:id', (0, validate_middleware_1.validate)(comment_schema_1.updateCommentSchema), comment_controller_1.updateCommentController);
router.delete('/:id', (0, validate_middleware_1.validate)(comment_schema_1.deleteCommentSchema), comment_controller_1.deleteCommentController);
exports.default = router;
