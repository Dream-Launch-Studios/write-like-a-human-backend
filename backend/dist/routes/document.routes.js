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
const documentController = __importStar(require("../controllers/document.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const document_schema_1 = require("../schemas/document.schema");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.post('/', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validateDocumentMiddleware, (0, validate_middleware_1.validate)(document_schema_1.createDocumentSchema), documentController.createDocument);
router.post('/convert-document-to-html', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validateDocumentMiddleware, documentController.convertDocumentToHtml);
router.post('/from-html', upload_middleware_1.uploadMiddleware.single('file'), upload_middleware_1.validateDocumentMiddleware, (0, validate_middleware_1.validate)(document_schema_1.createDocumentSchema), documentController.createDocumentFromHtml);
router.get('/', (0, validate_middleware_1.validate)(document_schema_1.listDocumentsSchema), documentController.listDocuments);
router.get('/:id', (0, validate_middleware_1.validate)(document_schema_1.getDocumentSchema), documentController.getDocument);
router.patch('/:id', (0, validate_middleware_1.validate)(document_schema_1.updateDocumentSchema), documentController.updateDocument);
router.delete('/:id', (0, validate_middleware_1.validate)(document_schema_1.deleteDocumentSchema), documentController.deleteDocument);
router.post('/:id/versions', (0, validate_middleware_1.validate)(document_schema_1.createVersionSchema), documentController.createVersion);
router.get('/:id/versions', (0, validate_middleware_1.validate)(document_schema_1.listVersionsSchema), documentController.listVersions);
exports.default = router;
