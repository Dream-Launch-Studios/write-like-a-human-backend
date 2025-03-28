import express from 'express';
import * as documentController from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
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

router.use(authMiddleware);

router.post(
    '/',
    uploadMiddleware.single('file'),
    validate(createDocumentSchema),
    documentController.createDocument
);

router.post(
    '/convert-pdf-to-html',
    uploadMiddleware.single('file'),
    validate(createDocumentSchema),
    documentController.convertPdfToHtml
);

// List user's documents
router.get(
    '/',
    validate(listDocumentsSchema),
    documentController.listDocuments
);

// Get a specific document
router.get(
    '/:id',
    validate(getDocumentSchema),
    documentController.getDocument
);

// Update a document
router.patch(
    '/:id',
    validate(updateDocumentSchema),
    documentController.updateDocument
);

// Delete a document
router.delete(
    '/:id',
    validate(deleteDocumentSchema),
    documentController.deleteDocument
);

// Create a new version of a document
router.post(
    '/:id/versions',
    // uploadMiddleware.single('file'),
    validate(createVersionSchema),
    documentController.createVersion
);

// List document versions
router.get(
    '/:id/versions',
    validate(listVersionsSchema),
    documentController.listVersions
);

export default router;