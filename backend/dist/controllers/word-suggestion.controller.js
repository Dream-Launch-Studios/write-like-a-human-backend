"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWordSuggestionController = exports.getDocumentWordSuggestionsController = exports.generateWordSuggestionsController = void 0;
const word_suggestion_service_1 = require("../services/word-suggestion.service");
/**
 * Generate and add word suggestions for a document using AI
 */
const generateWordSuggestionsController = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const userId = req.user.id;
        const aiSuggestions = await (0, word_suggestion_service_1.generateAIWordSuggestions)(documentId);
        if (!aiSuggestions || aiSuggestions.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No improvement suggestions found for this document',
                suggestions: [],
            });
        }
        const createdSuggestions = await (0, word_suggestion_service_1.batchCreateWordSuggestions)({
            documentId,
            userId,
            suggestions: aiSuggestions,
        });
        const response = {
            success: true,
            message: 'Suggestions generated and added successfully',
            suggestions: createdSuggestions.map(s => ({
                id: s.id,
                originalWord: s.originalWord,
                suggestedWord: s.suggestedWord,
                position: s.position,
                startOffset: s.startOffset,
                endOffset: s.endOffset,
                context: s.context,
                aiConfidence: s.aiConfidence,
            })),
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error generating word suggestions:', error);
        // Handle specific error cases
        if (error instanceof Error && error.message.includes('not found')) {
            const response = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }
        const response = {
            success: false,
            message: 'Failed to generate word suggestions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.generateWordSuggestionsController = generateWordSuggestionsController;
/**
 * Get word suggestions for a document
 */
const getDocumentWordSuggestionsController = async (req, res) => {
    try {
        const { id: documentId } = req.params;
        const { isAccepted, highlighted } = req.query;
        // Parse query parameters
        const filters = {};
        if (isAccepted !== undefined) {
            if (isAccepted === 'true')
                filters.isAccepted = true;
            else if (isAccepted === 'false')
                filters.isAccepted = false;
            else if (isAccepted === 'null')
                filters.isAccepted = null;
        }
        if (highlighted !== undefined) {
            filters.highlighted = highlighted === 'true';
        }
        const suggestions = await (0, word_suggestion_service_1.getDocumentWordSuggestions)(documentId, filters);
        const response = {
            success: true,
            suggestions,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting word suggestions:', error);
        const response = {
            success: false,
            message: 'Failed to get word suggestions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.getDocumentWordSuggestionsController = getDocumentWordSuggestionsController;
/**
 * Accept or reject a word suggestion
 */
const updateWordSuggestionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAccepted } = req.body;
        // Check if suggestion exists
        const existingSuggestion = await (0, word_suggestion_service_1.getWordSuggestionById)(id);
        if (!existingSuggestion) {
            const response = {
                success: false,
                message: 'Word suggestion not found',
            };
            res.status(404).json(response);
        }
        // Only the document owner or admin can accept/reject suggestions
        // You might need to add additional authorization checks here
        // For example, checking if the user is the owner of the document
        const updatedSuggestion = await (0, word_suggestion_service_1.updateWordSuggestion)(id, { isAccepted });
        const response = {
            success: true,
            message: isAccepted ? 'Suggestion accepted' : 'Suggestion rejected',
            suggestion: {
                id: updatedSuggestion === null || updatedSuggestion === void 0 ? void 0 : updatedSuggestion.id,
                isAccepted: updatedSuggestion === null || updatedSuggestion === void 0 ? void 0 : updatedSuggestion.isAccepted,
                acceptedAt: updatedSuggestion === null || updatedSuggestion === void 0 ? void 0 : updatedSuggestion.acceptedAt,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating word suggestion:', error);
        const response = {
            success: false,
            message: 'Failed to update word suggestion',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        res.status(500).json(response);
    }
};
exports.updateWordSuggestionController = updateWordSuggestionController;
