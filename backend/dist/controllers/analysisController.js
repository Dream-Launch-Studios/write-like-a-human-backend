"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDocument = exports.analyzeRawText = void 0;
const config_1 = __importDefault(require("../config/config"));
const prompts_1 = require("../utils/prompts");
// Helper function to perform text analysis
const analyzeText = (text_1, ...args_1) => __awaiter(void 0, [text_1, ...args_1], void 0, function* (text, isDocument = false) {
    try {
        const prompt = isDocument
            ? `${prompts_1.documentAnalysisPrompt}${text}`
            : `${prompts_1.textAnalysisPrompt}${text}`;
        // Basic text metrics
        const wordCount = text.trim().split(/\s+/).length;
        const sentenceCount = text.split(/[.!?]+\s/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;
        // Complexity analysis (basic implementation)
        const complexWords = text
            .split(/\s+/)
            .filter((word) => word.length > 6).length;
        const complexityScore = (complexWords / wordCount) * 100;
        // Grammar check (placeholder - integrate with a grammar checking service)
        const grammarScore = Math.min(90 + Math.random() * 10, 100); // Placeholder score
        // Overall score calculation
        const readabilityScore = Math.max(0, 100 -
            Math.abs(avgWordsPerSentence - 15) * 2 -
            (complexityScore > 20 ? complexityScore - 20 : 0));
        // Generate feedback based on metrics
        const feedback = [];
        if (avgWordsPerSentence > 20) {
            feedback.push("Consider using shorter sentences for better readability");
        }
        if (complexityScore > 20) {
            feedback.push("Text contains many complex words. Consider simplifying some terms");
        }
        if (wordCount < 100) {
            feedback.push("Consider adding more content to fully develop your ideas");
        }
        // Generate suggestions
        const suggestions = [];
        if (readabilityScore < 70) {
            suggestions.push("Break down longer sentences into smaller ones");
            suggestions.push("Use simpler words where possible");
        }
        if (grammarScore < 95) {
            suggestions.push("Review text for potential grammar improvements");
        }
        return {
            metrics: {
                wordCount,
                sentenceCount,
                avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
                complexityScore: complexityScore.toFixed(1),
                grammarScore: grammarScore.toFixed(1),
                readabilityScore: readabilityScore.toFixed(1),
            },
            feedback: feedback.length ? feedback : ["Text appears well-structured"],
            suggestions: suggestions.length
                ? suggestions
                : ["No major improvements needed"],
            score: readabilityScore,
            prompt,
        };
    }
    catch (error) {
        console.error("Text analysis error:", error);
        throw new Error("Failed to analyze text");
    }
});
const analyzeRawText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Text content is required" });
        }
        const analysis = yield analyzeText(text);
        res.status(200).json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.analyzeRawText = analyzeRawText;
const analyzeDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield config_1.default.document.findUnique({
            where: { id: req.params.id },
            include: {
                feedbacks: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        // Check document access
        const hasAccess = yield config_1.default.document.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { userId: req.user.id },
                    {
                        group: {
                            OR: [
                                { adminId: req.user.id },
                                { members: { some: { userId: req.user.id } } },
                            ],
                        },
                    },
                ],
            },
        });
        if (!hasAccess && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        const textAnalysis = yield analyzeText(document.content, true);
        res.status(200).json({
            document: {
                id: document.id,
                title: document.title,
                analysis: textAnalysis,
                feedbacks: document.feedbacks,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.analyzeDocument = analyzeDocument;
