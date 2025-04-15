import express from 'express';
import * as analysisController from '../controllers/analysis.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    analyzeDocumentSchema,
    getAnalysisSchema,
    getSectionsSchema,
    getMetricsSchema
} from '../schemas/analysis.schema';

const router = express.Router();

router.use(authMiddleware);

// Analyze a document for AI content
router.post(
    '/documents/:id/analyze',
    validate(analyzeDocumentSchema),
    analysisController.analyzeDocument
);

// Get AI analysis results for a document
router.get(
    '/documents/:id/analysis',
    validate(getAnalysisSchema),
    analysisController.getAnalysis
);

// Get document sections with AI detection
router.get(
    '/documents/:id/sections',
    validate(getSectionsSchema),
    analysisController.getDocumentSections
);
    
// Get document text metrics
router.get(
    '/documents/:id/metrics',
    validate(getMetricsSchema),
    analysisController.getTextMetrics
);

export default router;