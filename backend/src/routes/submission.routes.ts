import express from 'express';
import {
    getSubmissionByIdController,
    updateSubmissionStatusController,
    getUserSubmissionsController,
    deleteSubmissionController,
    resubmitAssignmentController,
    getSubmissionFeedbackController,
    addSubmissionFeedbackController
} from '../controllers/submission.controller';
import {
    submissionParamsSchema,
    updateSubmissionStatusSchema,
    resubmitAssignmentSchema,
    addSubmissionFeedbackSchema
} from '../schemas/submission.schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadMiddleware, validatePdfMiddleware } from '../middleware/upload.middleware';

const router = express.Router();

router.use(authMiddleware);


router.get(
    '/submissions/me',
    getUserSubmissionsController
);

router.get(
    '/submissions/:id',
    validate(submissionParamsSchema),
    getSubmissionByIdController
);

router.patch(
    '/submissions/:id/status',
    validate(updateSubmissionStatusSchema),
    updateSubmissionStatusController
);

router.delete(
    '/submissions/:id',
    validate(submissionParamsSchema),
    deleteSubmissionController
);

router.post(
    '/submissions/:id/resubmit',
    uploadMiddleware.single('file'),
    validatePdfMiddleware,
    validate(resubmitAssignmentSchema),
    resubmitAssignmentController
);

router.get(
    '/submissions/:id/feedback',
    validate(submissionParamsSchema),
    getSubmissionFeedbackController
);

router.post(
    '/submissions/:id/feedback',
    validate(addSubmissionFeedbackSchema),
    addSubmissionFeedbackController
);

export default router;