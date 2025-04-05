import express from 'express';
import {
    getSubmissionByIdController,
    updateSubmissionStatusController, deleteSubmissionController,
    resubmitAssignmentController,
    getSubmissionFeedbackController,
    addSubmissionFeedbackController,
    getUserSubmissionsByAssignmentIdController,
    finalSubmitAssignmentController,
    evaluateSubmissionController
} from '../controllers/submission.controller';
import {
    submissionParamsSchema,
    updateSubmissionStatusSchema,
    resubmitAssignmentSchema,
    addSubmissionFeedbackSchema,
    userSubmissionByAssignmentIdParamsSchema,
    finalSubmitAssignmentSchema,
    evaluateSubmissionSchema
} from '../schemas/submission.schema';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { uploadMiddleware, validatePdfMiddleware } from '../middleware/upload.middleware';

const router = express.Router();

router.use(authMiddleware);


router.get(
    '/assignments/:id',
    validate(userSubmissionByAssignmentIdParamsSchema),
    getUserSubmissionsByAssignmentIdController
);

router.post("/:id/final-submit", validate(finalSubmitAssignmentSchema), finalSubmitAssignmentController)
router.post("/results/:id/evaluate", validate(evaluateSubmissionSchema), evaluateSubmissionController)



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