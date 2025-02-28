"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeDocument = exports.analyzeRawText = void 0;
const textAnalysis_1 = require("../utils/textAnalysis");
const analyzeRawText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Text content is required" });
        }
        const analysis = await (0, textAnalysis_1.analyzeText)(text);
        res.status(200).json({ analysis });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.analyzeRawText = analyzeRawText;
const analyzeDocument = async (req, res) => {
    try {
        const { text } = req.body;
        const analysis = await (0, textAnalysis_1.analyzeText)(text);
        res.status(200).json({
            success: true,
            analysis,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.analyzeDocument = analyzeDocument;
