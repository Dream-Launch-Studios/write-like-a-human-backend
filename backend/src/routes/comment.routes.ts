import express from 'express';
import {
    createDocumentComment,
    getDocumentCommentsController,
    updateCommentController,
    deleteCommentController
} from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createDocumentCommentSchema,
    updateCommentSchema,
    deleteCommentSchema,
    getDocumentCommentsSchema
} from '../schemas/comment.schema';

const router = express.Router();

router.use(authMiddleware);

router.post(
    '/documents/:id/comments',
    validate(createDocumentCommentSchema),
    createDocumentComment
);

router.get(
    '/documents/:id/comments',
    validate(getDocumentCommentsSchema),
    getDocumentCommentsController
);

router.patch(
    '/:id',
    validate(updateCommentSchema),
    updateCommentController
);

router.delete(
    '/:id',
    validate(deleteCommentSchema),
    deleteCommentController
);

export default router;