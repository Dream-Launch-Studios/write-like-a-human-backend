import express from 'express';
import {
    generateWordSuggestionsController,
    getDocumentWordSuggestionsController,
    updateWordSuggestionController
} from '../controllers/word-suggestion.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { generateWordSuggestionsSchema, getWordSuggestionsSchema, updateWordSuggestionSchema } from '../schemas/word-suggestion.schema';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Document word suggestions
router.post(
    '/documents/:id/suggestions',
    validate(generateWordSuggestionsSchema),
    generateWordSuggestionsController
);

router.get(
    '/documents/:id/suggestions',
    validate(getWordSuggestionsSchema),
    getDocumentWordSuggestionsController
);

// Word suggestion management
router.patch(
    '/suggestions/:id',
    validate(updateWordSuggestionSchema),
    updateWordSuggestionController
);

export default router;