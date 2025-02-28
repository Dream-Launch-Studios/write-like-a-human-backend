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
// src/routes/documentRoutes.ts
const express_1 = require("express");
const documentController = __importStar(require("../controllers/documentController"));
const server_1 = require("../middleware/server");
const multer_1 = __importDefault(require("multer"));
const documentRouter = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Helper function to adapt controller to Express middleware
const adaptRoute = (controller) => {
    return (req, res, next) => {
        return Promise.resolve(controller(req, res)).catch(next);
    };
};
documentRouter.use(server_1.authenticateUser);
documentRouter.get("/", adaptRoute(documentController.listDocuments));
documentRouter.post("/new", adaptRoute(documentController.createDocument));
documentRouter.post("/upload", upload.single("file"), adaptRoute(documentController.uploadDocument));
documentRouter.get("/:id", adaptRoute(documentController.getDocument));
documentRouter.put("/:id", adaptRoute(documentController.updateDocument));
documentRouter.get("/:id/versions", adaptRoute(documentController.getDocumentVersions));
documentRouter.get("/:id/analyze", adaptRoute(documentController.analyzeDocument));
exports.default = documentRouter;
