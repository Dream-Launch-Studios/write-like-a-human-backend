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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextMetrics = exports.getDocumentSections = exports.getAnalysis = exports.analyzeDocument = void 0;
const documentService = __importStar(require("../services/document.service"));
const analysisService = __importStar(require("../services/analysis.service"));
/**
 * Analyze a document for AI content
 */
const analyzeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        // Get document from service
        const document = await documentService.getDocumentById(id);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }
        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Check if analysis already exists
        const existingAnalysis = await analysisService.getAnalysisByDocumentId(id);
        if (existingAnalysis) {
            const response = {
                success: true,
                message: 'Document analysis already exists',
                analysisId: existingAnalysis.id
            };
            res.status(200).json(response);
            return;
        }
        const analysisJob = await analysisService.initiateAnalysis(document);
        const response = {
            success: true,
            message: 'Document analysis initiated',
            analysisId: analysisJob.id
        };
        res.status(202).json(response);
    }
    catch (error) {
        console.error('Error analyzing document:', error);
        const response = {
            success: false,
            message: 'Failed to analyze document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.analyzeDocument = analyzeDocument;
/**
 * Get AI analysis results for a document
 */
const getAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        // Get document from service
        const document = await documentService.getDocumentById(id);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }
        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Get analysis results
        const analysis = await analysisService.getAnalysisByDocumentId(id);
        if (!analysis) {
            const response = {
                success: false,
                message: 'Analysis not found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            analysis
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting analysis:', error);
        const response = {
            success: false,
            message: 'Failed to get analysis',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getAnalysis = getAnalysis;
/**
 * Get document sections with AI detection
 */
const getDocumentSections = async (req, res) => {
    try {
        const { id } = req.params;
        // Get document from service
        const document = await documentService.getDocumentById(id);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }
        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Get sections
        const sections = await analysisService.getDocumentSections(id);
        if (!sections || sections.length === 0) {
            const response = {
                success: false,
                message: 'No sections found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            sections
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting document sections:', error);
        const response = {
            success: false,
            message: 'Failed to get document sections',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getDocumentSections = getDocumentSections;
/**
 * Get document text metrics
 */
const getTextMetrics = async (req, res) => {
    try {
        const { id } = req.params;
        // Get document from service
        const document = await documentService.getDocumentById(id);
        if (!document) {
            const response = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }
        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }
        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }
        // Get metrics
        const metrics = await analysisService.getTextMetrics(id);
        if (!metrics) {
            const response = {
                success: false,
                message: 'No metrics found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            metrics
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting text metrics:', error);
        const response = {
            success: false,
            message: 'Failed to get text metrics',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
};
exports.getTextMetrics = getTextMetrics;
