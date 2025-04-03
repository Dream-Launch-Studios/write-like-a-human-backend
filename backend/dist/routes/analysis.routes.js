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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analysisController = __importStar(require("../controllers/analysis.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const analysis_schema_1 = require("../schemas/analysis.schema");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// Analyze a document for AI content
router.post('/documents/:id/analyze', (0, validate_middleware_1.validate)(analysis_schema_1.analyzeDocumentSchema), analysisController.analyzeDocument);
// Get AI analysis results for a document
router.get('/documents/:id/analysis', (0, validate_middleware_1.validate)(analysis_schema_1.getAnalysisSchema), analysisController.getAnalysis);
// Get document sections with AI detection
router.get('/documents/:id/sections', (0, validate_middleware_1.validate)(analysis_schema_1.getSectionsSchema), analysisController.getDocumentSections);
// Get document text metrics
router.get('/documents/:id/metrics', (0, validate_middleware_1.validate)(analysis_schema_1.getMetricsSchema), analysisController.getTextMetrics);
exports.default = router;
