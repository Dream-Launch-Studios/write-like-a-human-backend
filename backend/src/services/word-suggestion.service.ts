import { PrismaClient } from '@prisma/client';
import {
    CreateWordSuggestionData,
    BatchCreateWordSuggestionsData,
    UpdateWordSuggestionData,
    AISuggestion
} from '../types/word-suggestion.types';
import { openai } from '../lib/openai';

const prisma = new PrismaClient();

/**
 * Generate word suggestions using OpenAI
 */
export const generateAIWordSuggestions = async (documentId: string) => {
    // Retrieve document content
    const document = await prisma.document.findUnique({
        where: {
            id: documentId
        },
        select: {
            id: true,
            title: true,
            content: true
        }
    });

    if (!document) {
        throw new Error(`Document with ID ${documentId} not found`);
    }

    // Get AI analysis if available
    const aiAnalysis = await prisma.aIAnalysis.findUnique({
        where: {
            documentId
        },
        include: {
            sections: true
        }
    });

    console.log(`📃 document : `)
    console.log(document)

    // Prepare prompt for OpenAI
    const prompt = {
        role: "system",
        content: `Analyze the following text and identify words or phrases that could be improved to make the writing appear more human-like and less AI-generated. 

Document Title: ${document.title}

For each suggestion, provide:
1. The original word or phrase
2. A suggested replacement that would make the text appear more human-written
3. The position (word index in the document)
4. The character start and end positions
5. The surrounding context (a few words before and after)
6. A confidence score (0-1) for how likely this change would improve the text's authenticity

${aiAnalysis ? "Additional context - AI Detection Score: " + aiAnalysis.overallAiScore : ""}

Document Content:
${document.content}

Format your response as a JSON array of suggestions, with each suggestion containing: originalWord, suggestedWord, position, startOffset, endOffset, context, and aiConfidence.`,
    };

    // Call OpenAI API
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [prompt as any],
        response_format: { type: "json_object" },
        temperature: 0.3,
    });

    // Parse the AI response
    try {
        const responseContent = response.choices[0].message.content || "{}";
        const parsedResponse = JSON.parse(responseContent);

        // Ensure we have a suggestions array
        const suggestions = Array.isArray(parsedResponse.suggestions)
            ? parsedResponse.suggestions
            : (Array.isArray(parsedResponse) ? parsedResponse : []);

        return suggestions as AISuggestion[];
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Failed to parse AI suggestions');
    }
};

/**
 * Create a single word suggestion
 */
export const createWordSuggestion = async (data: CreateWordSuggestionData) => {
    // Check if document exists
    const documentExists = await prisma.document.findUnique({
        where: {
            id: data.documentId
        }
    });

    if (!documentExists) {
        throw new Error(`Document with ID ${data.documentId} not found`);
    }

    const suggestion = await prisma.wordSuggestion.create({
        data: {
            originalWord: data.originalWord,
            suggestedWord: data.suggestedWord,
            position: data.position,
            startOffset: data.startOffset,
            endOffset: data.endOffset,
            context: data.context,
            aiConfidence: data.aiConfidence,
            documentId: data.documentId,
            userId: data.userId,
            highlighted: true,
        },
    });

    return suggestion;
};

/**
 * Batch create multiple word suggestions
 */
export const batchCreateWordSuggestions = async (data: BatchCreateWordSuggestionsData) => {
    // Check if document exists
    const documentExists = await prisma.document.findUnique({
        where: {
            id: data.documentId
        }
    });

    if (!documentExists) {
        throw new Error(`Document with ID ${data.documentId} not found`);
    }

    // Create all suggestions in a transaction
    const suggestions = await prisma.$transaction(
        data.suggestions.map(suggestion =>
            prisma.wordSuggestion.create({
                data: {
                    originalWord: suggestion.originalWord,
                    suggestedWord: suggestion.suggestedWord,
                    position: suggestion.position,
                    startOffset: suggestion.startOffset,
                    endOffset: suggestion.endOffset,
                    context: suggestion.context,
                    aiConfidence: suggestion.aiConfidence,
                    documentId: data.documentId,
                    userId: data.userId,
                    highlighted: true,
                },
            })
        )
    );

    return suggestions;
};

/**
 * Get word suggestions for a document
 */
export const getDocumentWordSuggestions = async (
    documentId: string,
    filters?: {
        isAccepted?: boolean | null,
        highlighted?: boolean
    }
) => {
    const whereClause: any = {
        documentId,
    };

    if (filters?.isAccepted !== undefined) {
        whereClause.isAccepted = filters.isAccepted;
    }

    if (filters?.highlighted !== undefined) {
        whereClause.highlighted = filters.highlighted;
    }

    const suggestions = await prisma.wordSuggestion.findMany({
        where: whereClause,
        orderBy: [
            { position: 'asc' },
            { createdAt: 'desc' }
        ],
    });

    return suggestions;
};

/**
 * Get a word suggestion by ID
 */
export const getWordSuggestionById = async (id: string) => {
    const suggestion = await prisma.wordSuggestion.findUnique({
        where: {
            id,
        },
    });

    return suggestion;
};

/**
 * Update a word suggestion (accept or reject)
 */
export const updateWordSuggestion = async (id: string, data: UpdateWordSuggestionData) => {
    try {
        const suggestion = await prisma.wordSuggestion.update({
            where: {
                id,
            },
            data: {
                isAccepted: data.isAccepted,
                acceptedAt: data.isAccepted ? new Date() : null,
                highlighted: false, // Once a decision is made, no need to highlight
            },
        });

        return suggestion;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Delete a word suggestion
 */
export const deleteWordSuggestion = async (id: string) => {
    try {
        await prisma.wordSuggestion.delete({
            where: {
                id,
            },
        });

        return true;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return false;
        }
        throw error;
    }
};