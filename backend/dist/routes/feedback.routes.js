"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feedbackController = __importStar(require("../controllers/feedback.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const feedback_schema_1 = require("../schemas/feedback.schema");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.post('/documents/:id/feedback', (0, validate_middleware_1.validate)(feedback_schema_1.createFeedbackSchema), feedbackController.createFeedback);
router.get('/documents/:id/feedback', (0, validate_middleware_1.validate)(feedback_schema_1.getDocumentFeedbackSchema), feedbackController.getDocumentFeedback);
router.get('/:id', (0, validate_middleware_1.validate)(feedback_schema_1.getFeedbackSchema), feedbackController.getFeedback);
router.patch('/feedback/:id', (0, validate_middleware_1.validate)(feedback_schema_1.updateFeedbackSchema), feedbackController.updateFeedback);
// Delete feedback
router.delete('/feedback/:id', (0, validate_middleware_1.validate)(feedback_schema_1.deleteFeedbackSchema), feedbackController.deleteFeedback);
// Get feedback metrics
router.get('/:id/metrics', (0, validate_middleware_1.validate)(feedback_schema_1.getFeedbackMetricsSchema), feedbackController.getFeedbackMetrics);
exports.default = router;
