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

router.use(authMiddleware);

router.post(
    '/documents/:id/feedback',
    validate(createFeedbackSchema),
    feedbackController.createFeedback
); 

router.get(
    '/documents/:id/feedback',
    validate(getDocumentFeedbackSchema),
    feedbackController.getDocumentFeedback
);

router.get(
    '/:id',
    validate(getFeedbackSchema),
    feedbackController.getFeedback
);

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