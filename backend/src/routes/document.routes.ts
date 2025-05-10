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
import { checkDocumentLimitMiddleware, checkDocumentVersionLimitMiddleware, incrementDocumentCountMiddleware } from '../middleware/subscription.middleware';

const router = express.Router();

router.use(authMiddleware);

// NOT IN USE
router.post(
    '/',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(createDocumentSchema),
    documentController.createDocument
);

// NOT IN USE
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
    checkDocumentLimitMiddleware,
    incrementDocumentCountMiddleware,
    documentController.createDocumentFromHtml
);


router.post(
    '/from-html-v2',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(createDocumentSchema),
    checkDocumentLimitMiddleware,
    incrementDocumentCountMiddleware,
    documentController.createAndAnalyzeDocumentWithAI
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
    checkDocumentVersionLimitMiddleware,
    documentController.createVersion
);

router.get(
    '/:id/versions',
    validate(listVersionsSchema),
    documentController.listVersions
);

export default router;