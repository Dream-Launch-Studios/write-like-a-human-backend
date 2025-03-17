import express from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createFeedbackSchema,
    getFeedbackSchema,
    getDocumentFeedbackSchema,
    updateFeedbackSchema,
    deleteFeedbackSchema,
    getFeedbackMetricsSchema
} from '../schemas/feedback.schema';

const router = express.Router();

// Apply authentication middleware to all feedback routes
router.use(authMiddleware);

// Create feedback for a document
router.post(
    '/documents/:id/feedback',
    validate(createFeedbackSchema),
    feedbackController.createFeedback
); 

// Get all feedback for a document
router.get(
    '/documents/:id/feedback',
    validate(getDocumentFeedbackSchema),
    feedbackController.getDocumentFeedback
);

// Get a specific feedback by ID
router.get(
    '/:id',
    validate(getFeedbackSchema),
    feedbackController.getFeedback
);

// Update feedback
router.patch(
    '/feedback/:id',
    validate(updateFeedbackSchema),
    feedbackController.updateFeedback
);

// Delete feedback
router.delete(
    '/feedback/:id',
    validate(deleteFeedbackSchema),
    feedbackController.deleteFeedback
);

// Get feedback metrics
router.get(
    '/:id/metrics',
    validate(getFeedbackMetricsSchema),
    feedbackController.getFeedbackMetrics
);

export default router;