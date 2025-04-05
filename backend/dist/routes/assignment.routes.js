"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assignment_controller_1 = require("../controllers/assignment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const assignment_schema_1 = require("../schemas/assignment.schema");
const upload_middleware_1 = require("../middleware/upload.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.post('/groups/:id/assignments', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validateDocumentMiddleware, (0, validate_middleware_1.validate)(assignment_schema_1.createAssignmentSchema), assignment_controller_1.createAssignmentController);
router.get('/groups/:id/assignments', (0, validate_middleware_1.validate)(assignment_schema_1.groupParamsSchema), assignment_controller_1.getGroupAssignmentsController);
// Assignment management
router.get('/:id', (0, validate_middleware_1.validate)(assignment_schema_1.assignmentParamsSchema), assignment_controller_1.getAssignmentByIdController);
router.patch('/:id', (0, validate_middleware_1.validate)(assignment_schema_1.updateAssignmentSchema), assignment_controller_1.updateAssignmentController);
router.delete('/:id', (0, validate_middleware_1.validate)(assignment_schema_1.assignmentParamsSchema), assignment_controller_1.deleteAssignmentController);
// Assignment submissions
router.post('/:id/submissions', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validateDocumentMiddleware, (0, validate_middleware_1.validate)(assignment_schema_1.submitAssignmentSchema), assignment_controller_1.submitAssignmentController);
router.get('/:id/submissions', (0, validate_middleware_1.validate)(assignment_schema_1.assignmentParamsSchema), assignment_controller_1.getAssignmentSubmissionsController);
// Submission management
router.get('/submissions/:id', (0, validate_middleware_1.validate)(assignment_schema_1.assignmentParamsSchema), assignment_controller_1.getSubmissionByIdController);
router.patch('/submissions/:id/status', (0, validate_middleware_1.validate)(assignment_schema_1.updateSubmissionStatusSchema), assignment_controller_1.updateSubmissionStatusController);
exports.default = router;
