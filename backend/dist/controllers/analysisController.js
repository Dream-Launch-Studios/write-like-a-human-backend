"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFeedback = exports.generateDocumentSuggestions = exports.compareDocumentVersions = exports.analyzeDocument = exports.analyzeRawText = void 0;
const config_1 = __importDefault(require("../config/config"));
const textAnalysis_1 = require("../utils/textAnalysis");
/**
 * Analyze raw text submitted by user
 */
const analyzeRawText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || typeof text !== "string") {
            return res.status(400).json({
                success: false,
                error: "Valid text content is required",
            });
        }
        // Get comprehensive analysis
        const analysis = await (0, textAnalysis_1.analyzeText)(text);
        // Return analysis with success status
        res.status(200).json({
            success: true,
            analysis,
            message: "Text analysis completed successfully",
        });
    }
    catch (error) {
        console.error("Error in text analysis:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.analyzeRawText = analyzeRawText;
/**
 * Analyze a document from the database
 */
const analyzeDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Validate access permissions
        const document = await config_1.default.document.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    {
                        group: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or access denied",
            });
        }
        // Get comprehensive analysis
        const analysis = await (0, textAnalysis_1.analyzeDocumentById)(id, config_1.default);
        // Return analysis with success status
        res.status(200).json({
            success: true,
            analysis,
            documentInfo: {
                id: document.id,
                title: document.title,
                version: document.versionNumber,
            },
            message: "Document analysis completed successfully",
        });
    }
    catch (error) {
        console.error("Error in document analysis:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.analyzeDocument = analyzeDocument;
/**
 * Compare two versions of a document
 */
const compareDocumentVersions = async (req, res) => {
    try {
        const { documentId, compareWithId } = req.body;
        const userId = req.user.id;
        // Validate document IDs
        if (!documentId || !compareWithId) {
            return res.status(400).json({
                success: false,
                error: "Both document IDs are required",
            });
        }
        // Fetch both documents
        const document1 = await config_1.default.document.findFirst({
            where: {
                id: documentId,
                OR: [
                    { userId },
                    {
                        group: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        const document2 = await config_1.default.document.findFirst({
            where: {
                id: compareWithId,
                OR: [
                    { userId },
                    {
                        group: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!document1 || !document2) {
            return res.status(404).json({
                success: false,
                error: "One or both documents not found or access denied",
            });
        }
        // Compare the documents
        const comparisonAnalysis = await (0, textAnalysis_1.compareTexts)(document1.content, document2.content);
        // Return comparison with success status
        res.status(200).json({
            success: true,
            comparison: comparisonAnalysis,
            documentInfo: {
                original: {
                    id: document1.id,
                    title: document1.title,
                    version: document1.versionNumber,
                },
                comparison: {
                    id: document2.id,
                    title: document2.title,
                    version: document2.versionNumber,
                },
            },
            message: "Document comparison completed successfully",
        });
    }
    catch (error) {
        console.error("Error in document comparison:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.compareDocumentVersions = compareDocumentVersions;
/**
 * Generate word-level suggestions for a document
 */
const generateDocumentSuggestions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Validate document access
        const document = await config_1.default.document.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    {
                        group: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or access denied",
            });
        }
        // Generate word suggestions
        const suggestions = await (0, textAnalysis_1.generateWordSuggestions)(id, userId, config_1.default);
        // Return suggestions with success status
        res.status(200).json({
            success: true,
            suggestions,
            documentInfo: {
                id: document.id,
                title: document.title,
            },
            message: "Word suggestions generated successfully",
        });
    }
    catch (error) {
        console.error("Error generating word suggestions:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.generateDocumentSuggestions = generateDocumentSuggestions;
/**
 * Save feedback from the analysis
 */
const saveFeedback = async (req, res) => {
    try {
        const { documentId, content, aiScore } = req.body;
        const userId = req.user.id;
        // Validate request
        if (!documentId || !content) {
            return res.status(400).json({
                success: false,
                error: "Document ID and feedback content are required",
            });
        }
        // Check document access
        const document = await config_1.default.document.findFirst({
            where: {
                id: documentId,
                OR: [
                    { userId },
                    {
                        group: {
                            members: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or access denied",
            });
        }
        // Create feedback record
        const feedback = await config_1.default.feedback.create({
            data: {
                content,
                aiScore: aiScore || null,
                status: "ANALYZED",
                userId,
                documentId: document.id,
                groupId: document.groupId,
            },
        });
        // Return success response
        res.status(201).json({
            success: true,
            feedback,
            message: "Feedback saved successfully",
        });
    }
    catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.saveFeedback = saveFeedback;
