"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const word_suggestion_controller_1 = require("../controllers/word-suggestion.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const word_suggestion_schema_1 = require("../schemas/word-suggestion.schema");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Document word suggestions
router.post('/documents/:id/suggestions', (0, validate_middleware_1.validate)(word_suggestion_schema_1.generateWordSuggestionsSchema), word_suggestion_controller_1.generateWordSuggestionsController);
router.get('/documents/:id/suggestions', (0, validate_middleware_1.validate)(word_suggestion_schema_1.getWordSuggestionsSchema), word_suggestion_controller_1.getDocumentWordSuggestionsController);
// Word suggestion management
router.patch('/suggestions/:id', (0, validate_middleware_1.validate)(word_suggestion_schema_1.updateWordSuggestionSchema), word_suggestion_controller_1.updateWordSuggestionController);
exports.default = router;
