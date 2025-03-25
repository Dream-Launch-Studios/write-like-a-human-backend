"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const submission_controller_1 = require("../controllers/submission.controller");
const submission_schema_1 = require("../schemas/submission.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// User's submissions
router.get('/submissions/me', submission_controller_1.getUserSubmissionsController);
// Submission management
router.get('/submissions/:id', (0, validate_middleware_1.validate)(submission_schema_1.submissionParamsSchema), submission_controller_1.getSubmissionByIdController);
router.patch('/submissions/:id/status', (0, validate_middleware_1.validate)(submission_schema_1.updateSubmissionStatusSchema), submission_controller_1.updateSubmissionStatusController);
router.delete('/submissions/:id', (0, validate_middleware_1.validate)(submission_schema_1.submissionParamsSchema), submission_controller_1.deleteSubmissionController);
// Resubmit assignment
router.post('/submissions/:id/resubmit', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validatePdfMiddleware, (0, validate_middleware_1.validate)(submission_schema_1.resubmitAssignmentSchema), submission_controller_1.resubmitAssignmentController);
// Submission feedback
router.get('/submissions/:id/feedback', (0, validate_middleware_1.validate)(submission_schema_1.submissionParamsSchema), submission_controller_1.getSubmissionFeedbackController);
router.post('/submissions/:id/feedback', (0, validate_middleware_1.validate)(submission_schema_1.addSubmissionFeedbackSchema), submission_controller_1.addSubmissionFeedbackController);
exports.default = router;
