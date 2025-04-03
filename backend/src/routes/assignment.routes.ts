import express from 'express';
import {
    createAssignmentController,
    getGroupAssignmentsController,
    getAssignmentByIdController,
    updateAssignmentController,
    deleteAssignmentController,
    submitAssignmentController,
    getAssignmentSubmissionsController,
    getSubmissionByIdController,
    updateSubmissionStatusController
} from '../controllers/assignment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    createAssignmentSchema,
    updateAssignmentSchema,
    groupParamsSchema,
    assignmentParamsSchema,
    submitAssignmentSchema,
    updateSubmissionStatusSchema
} from '../schemas/assignment.schema';
import { uploadMiddleware, validateDocumentMiddleware, validatePdfMiddleware } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post(
    '/groups/:id/assignments',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(createAssignmentSchema),
    createAssignmentController
);

router.get(
    '/groups/:id/assignments',
    validate(groupParamsSchema),
    getGroupAssignmentsController
);

// Assignment management
router.get(
    '/:id',
    validate(assignmentParamsSchema),
    getAssignmentByIdController
);

router.patch(
    '/:id',
    validate(updateAssignmentSchema),
    updateAssignmentController
);

router.delete(
    '/:id',
    validate(assignmentParamsSchema),
    deleteAssignmentController
);

// Assignment submissions
router.post(
    '/:id/submissions',
    uploadMiddleware.single('file'),
    validateDocumentMiddleware,
    validate(submitAssignmentSchema),
    submitAssignmentController
);

router.get(
    '/:id/submissions',
    validate(assignmentParamsSchema),
    getAssignmentSubmissionsController
);

// Submission management
router.get(
    '/submissions/:id',
    validate(assignmentParamsSchema),
    getSubmissionByIdController
);

router.patch(
    '/submissions/:id/status',
    validate(updateSubmissionStatusSchema),
    updateSubmissionStatusController
);

export default router;