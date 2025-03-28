import express from 'express';
import * as documentController from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadMiddleware, validateDocumentMiddleware } from '../middleware/upload.middleware';
import {
    createDocumentSchema,
    getDocumentSchema,
    listDocumentsSchema,
    updateDocumentSchema,
    deleteDocumentSchema,
    createVersionSchema,
    listVersionsSchema
} from '../schemas/document.schema';

const router = express.Router();

// router.use(authMiddleware);

router.post(
    '/',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(createDocumentSchema),
    documentController.createDocument
);

router.post(
    '/convert-document-to-html',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    documentController.convertDocumentToHtml
);

router.post(
    '/from-html',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(createDocumentSchema),
    documentController.createDocumentFromHtml
);

router.get(
    '/',
    validate(listDocumentsSchema),
    documentController.listDocuments
);

router.get(
    '/:id',
    validate(getDocumentSchema),
    documentController.getDocument
);

router.patch(
    '/:id',
    validate(updateDocumentSchema),
    documentController.updateDocument
);

router.delete(
    '/:id',
    validate(deleteDocumentSchema),
    documentController.deleteDocument
);

router.post(
    '/:id/versions',
    validate(createVersionSchema),
    documentController.createVersion
);

router.get(
    '/:id/versions',
    validate(listVersionsSchema),
    documentController.listVersions
);

export default router;