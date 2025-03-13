/**
 * Comprehensive text analysis interface based on README specifications
 */
interface TextAnalysis {
    structuralComparison: {
        sentenceComplexity: {
            score: number;
            avgLength: number;
            structures: {
                simple: number;
                compound: number;
                complex: number;
            };
        };
        paragraphStructure: {
            score: number;
            organization: string;
            transitions: string;
            flow: string;
        };
        formatting: {
            score: number;
            headingConsistency: string;
            sectioning: string;
        };
    };
    vocabularyChoice: {
        lexicalDiversity: {
            score: number;
            typeTokenRatio: number;
            uniqueWords: number;
        };
        wordFrequency: {
            score: number;
            commonWords: string[];
            repetitions: Record<string, number>;
        };
        academicLanguage: {
            score: number;
            tone: string;
            sophistication: string;
        };
    };
    writingStyle: {
        readabilityScores: {
            fleschKincaid: number;
            smog: number;
            overall: number;
        };
        voiceAnalysis: {
            score: number;
            passiveCount: number;
            activeCount: number;
        };
        perspective: {
            score: number;
            pointOfView: string;
        };
        descriptiveLanguage: {
            score: number;
            dialogueUsage: string;
            techniques: string[];
        };
    };
    grammarMechanics: {
        punctuation: {
            score: number;
            frequency: Record<string, number>;
            usage: string;
        };
        grammarPatterns: {
            score: number;
            errors: string[];
            tendencies: string[];
        };
        spelling: {
            score: number;
            variations: string[];
            consistency: string;
        };
    };
    thematicElements: {
        keyThemes: {
            score: number;
            themes: string[];
            focus: string;
        };
        keywordFrequency: {
            score: number;
            keywords: Record<string, number>;
        };
        argumentDevelopment: {
            score: number;
            structure: string;
            progression: string;
        };
    };
    similarityMetrics: {
        nGramAnalysis: {
            score: number;
            patterns: string[];
            consistency: string;
        };
        tfIdfScore: number;
        jaccardSimilarity: number;
    };
    aiDetection: {
        originalityScore: number;
        predictabilityScore: number;
        humanLikeScore: number;
        flags: string[];
    };
    overallMetrics: {
        wordCount: number;
        sentenceCount: number;
        paragraphCount: number;
        growthMetrics?: {
            wordCountChange: number;
            complexityChange: number;
        };
    };
    feedback: {
        strengths: string[];
        improvements: string[];
        recommendations: string[];
    };
    improvedVersion: {
        text: string;
        explanationOfChanges: string[];
    };
}
/**
 * Analyze text according to README specifications and return comprehensive feedback
 */
export declare function analyzeText(text: string): Promise<TextAnalysis>;
/**
 * Compare two texts and generate growth metrics
 */
export declare function compareTexts(originalText: string, newText: string): Promise<TextAnalysis>;
/**
 * Analyze a document from the database
 */
export declare function analyzeDocumentById(documentId: string, prisma: any): Promise<TextAnalysis>;
/**
 * Generate word-level suggestions for a document
 */
export declare function generateWordSuggestions(documentId: string, userId: string, prisma: any): Promise<{
    documentId: string;
    userId: string;
    originalWord: any;
    suggestedWord: any;
    position: number;
    startOffset: number;
    endOffset: any;
    context: any;
    aiConfidence: any;
    highlighted: boolean;
    isAccepted: null;
}[]>;
export {};
