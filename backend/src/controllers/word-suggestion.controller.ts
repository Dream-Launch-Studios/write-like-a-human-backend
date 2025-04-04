import { Request, Response } from 'express';
import {
    generateAIWordSuggestions,
    batchCreateWordSuggestions,
    getDocumentWordSuggestions,
    getWordSuggestionById,
    updateWordSuggestion
} from '../services/word-suggestion.service';
import { ApiResponse } from '../types/word-suggestion.types';

/**
 * Generate and add word suggestions for a document using AI
 */
export const generateWordSuggestionsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;
        const userId = req.user.id;

        const aiSuggestions = await generateAIWordSuggestions(documentId);


        if (!aiSuggestions || aiSuggestions.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No improvement suggestions found for this document',
                suggestions: [],
            });
        }

        const createdSuggestions = await batchCreateWordSuggestions({
            documentId,
            userId,
            suggestions: aiSuggestions,
        });

        const response: ApiResponse = {
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
    } catch (error) {
        console.error('Error generating word suggestions:', error);

        // Handle specific error cases
        if (error instanceof Error && error.message.includes('not found')) {
            const response: ApiResponse = {
                success: false,
                message: error.message,
            };
            res.status(404).json(response);
        }

        const response: ApiResponse = {
            success: false,
            message: 'Failed to generate word suggestions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Get word suggestions for a document
 */
export const getDocumentWordSuggestionsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: documentId } = req.params;
        const { isAccepted, highlighted } = req.query;

        // Parse query parameters
        const filters: { isAccepted?: boolean | null, highlighted?: boolean } = {};

        if (isAccepted !== undefined) {
            if (isAccepted === 'true') filters.isAccepted = true;
            else if (isAccepted === 'false') filters.isAccepted = false;
            else if (isAccepted === 'null') filters.isAccepted = null;
        }

        if (highlighted !== undefined) {
            filters.highlighted = highlighted === 'true';
        }

        const suggestions = await getDocumentWordSuggestions(documentId, filters);

        const response: ApiResponse = {
            success: true,
            suggestions,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting word suggestions:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get word suggestions',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};

/**
 * Accept or reject a word suggestion
 */
export const updateWordSuggestionController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isAccepted } = req.body;

        // Check if suggestion exists
        const existingSuggestion = await getWordSuggestionById(id);
        if (!existingSuggestion) {
            const response: ApiResponse = {
                success: false,
                message: 'Word suggestion not found',
            };
            res.status(404).json(response);
        }

        // Only the document owner or admin can accept/reject suggestions
        // You might need to add additional authorization checks here
        // For example, checking if the user is the owner of the document

        const updatedSuggestion = await updateWordSuggestion(id, { isAccepted });

        const response: ApiResponse = {
            success: true,
            message: isAccepted ? 'Suggestion accepted' : 'Suggestion rejected',
            suggestion: {
                id: updatedSuggestion?.id,
                isAccepted: updatedSuggestion?.isAccepted,
                acceptedAt: updatedSuggestion?.acceptedAt,
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating word suggestion:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update word suggestion',
            error: error instanceof Error ? error.message : 'Unknown error',
        };

        res.status(500).json(response);
    }
};