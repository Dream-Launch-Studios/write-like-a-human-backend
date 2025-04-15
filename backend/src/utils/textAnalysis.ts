import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
export async function analyzeText(text: string): Promise<TextAnalysis> {
  try {
    // Basic text cleaning and metrics calculation
    const cleanText = text.trim();
    const words = cleanText.split(/\s+/);
    const sentences = cleanText.split(/[.!?]+\s/).filter(Boolean);
    const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean);

    // Calculate basic metrics
    const metrics = calculateBasicMetrics(cleanText);

    // Get AI analysis
    const aiAnalysis = await getAITextAnalysis(cleanText);

    // Create improved version
    const improvedVersion = await generateImprovedVersion(
      cleanText,
      aiAnalysis
    );

    // Combine all analyses
    return {
      ...aiAnalysis,
      overallMetrics: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
      },
      improvedVersion,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze text");
  }
}

/**
 * Calculate basic text metrics
 */
function calculateBasicMetrics(text: string) {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+\s/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  // Count punctuation
  const punctuationCount: Record<string, number> = {};
  const punctuationRegex = /[.,;:!?()[\]{}""'']/g;
  const matches = text.match(punctuationRegex) || [];

  matches.forEach((mark) => {
    punctuationCount[mark] = (punctuationCount[mark] || 0) + 1;
  });

  // Estimate passive voice
  const passiveRegex =
    /\b(am|is|are|was|were|be|been|being)\s+(\w+ed|built|done|made|created|written|found|sold)\b/gi;
  const passiveMatches = text.match(passiveRegex) || [];

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: words.length / Math.max(1, sentences.length),
    complexWords: words.filter((w) => w.length > 7).length,
    typeTokenRatio: uniqueWords.size / Math.max(1, words.length),
    passiveVoiceCount: passiveMatches.length,
    punctuationFrequency: punctuationCount,
  };
}

/**
 * Get AI-powered analysis of text
 */
async function getAITextAnalysis(
  text: string
): Promise<Omit<TextAnalysis, "improvedVersion">> {
  const prompt = `
  You are an expert writing analyst. Analyze the following text comprehensively and return a JSON object with your analysis.
  
  TEXT TO ANALYZE:
  ${text}
  
  Return ONLY a JSON object with no additional text. Follow this exact structure:
  {
    "structuralComparison": {
      "sentenceComplexity": {
        "score": [0-100 score],
        "avgLength": [average words per sentence],
        "structures": {
          "simple": [percentage],
          "compound": [percentage],
          "complex": [percentage]
        }
      },
      "paragraphStructure": {
        "score": [0-100 score],
        "organization": [brief assessment],
        "transitions": [brief assessment],
        "flow": [brief assessment]
      },
      "formatting": {
        "score": [0-100 score],
        "headingConsistency": [brief assessment],
        "sectioning": [brief assessment]
      }
    },
    "vocabularyChoice": {
      "lexicalDiversity": {
        "score": [0-100 score],
        "typeTokenRatio": [ratio value 0-1],
        "uniqueWords": [count]
      },
      "wordFrequency": {
        "score": [0-100 score],
        "commonWords": [array of 5 most common words],
        "repetitions": [object with words repeated more than 3 times]
      },
      "academicLanguage": {
        "score": [0-100 score],
        "tone": [brief assessment],
        "sophistication": [brief assessment]
      }
    },
    "writingStyle": {
      "readabilityScores": {
        "fleschKincaid": [score],
        "smog": [score],
        "overall": [0-100 score]
      },
      "voiceAnalysis": {
        "score": [0-100 score],
        "passiveCount": [count],
        "activeCount": [count]
      },
      "perspective": {
        "score": [0-100 score],
        "pointOfView": [1st/2nd/3rd person]
      },
      "descriptiveLanguage": {
        "score": [0-100 score],
        "dialogueUsage": [brief assessment],
        "techniques": [array of techniques used]
      }
    },
    "grammarMechanics": {
      "punctuation": {
        "score": [0-100 score],
        "frequency": [object with count of each punctuation],
        "usage": [brief assessment]
      },
      "grammarPatterns": {
        "score": [0-100 score],
        "errors": [array of common errors],
        "tendencies": [array of grammatical tendencies]
      },
      "spelling": {
        "score": [0-100 score],
        "variations": [array of spelling variations],
        "consistency": [brief assessment]
      }
    },
    "thematicElements": {
      "keyThemes": {
        "score": [0-100 score],
        "themes": [array of main themes],
        "focus": [brief assessment]
      },
      "keywordFrequency": {
        "score": [0-100 score],
        "keywords": [object with keyword frequency]
      },
      "argumentDevelopment": {
        "score": [0-100 score],
        "structure": [brief assessment],
        "progression": [brief assessment]
      }
    },
    "similarityMetrics": {
      "nGramAnalysis": {
        "score": [0-100 score],
        "patterns": [array of common patterns],
        "consistency": [brief assessment]
      },
      "tfIdfScore": [0-1 score],
      "jaccardSimilarity": [0-1 score]
    },
    "aiDetection": {
      "originalityScore": [0-100 score],
      "predictabilityScore": [0-100 score],
      "humanLikeScore": [0-100 score],
      "flags": [array of flags if detected]
    },
    "feedback": {
      "strengths": [array of 3-5 strengths],
      "weaknesses": [array of 3-5 areas for improvement],
      "recommendations": [array of 3-5 specific recommendations]
    }
  }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert writing analyst producing JSON output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    });

    const jsonString = completion.choices[0].message.content?.trim() || "{}";
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI analysis error:", error);
    throw new Error("Failed to complete AI analysis");
  }
}

/**
 * Generate an improved version of the text with explanations of changes
 */
async function generateImprovedVersion(
  originalText: string,
  analysis: any
): Promise<TextAnalysis["improvedVersion"]> {
  const prompt = `
  You are an expert writing coach. Based on the analysis of the following text, provide an improved version 
  that addresses the weaknesses while maintaining the strengths. Also provide a list explaining the changes made.
  
  ORIGINAL TEXT:
  ${originalText}
  
  ANALYSIS:
  Strengths: ${JSON.stringify(analysis.feedback.strengths)}
  Weaknesses: ${JSON.stringify(analysis.feedback.weaknesses)}
  
  Return ONLY a JSON object with no additional text using this structure:
  {
    "text": "The improved version of the text",
    "explanationOfChanges": ["Change 1 explanation", "Change 2 explanation", ...]
  }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert writing coach producing JSON output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 4000,
    });

    const jsonString = completion.choices[0].message.content?.trim() || "{}";
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Improved version generation error:", error);
    throw new Error("Failed to generate improved version");
  }
}

/**
 * Compare two texts and generate growth metrics
 */
export async function compareTexts(
  originalText: string,
  newText: string
): Promise<TextAnalysis> {
  // Analyze both texts
  const originalAnalysis = await analyzeText(originalText);
  const newAnalysis = await analyzeText(newText);

  // Calculate growth metrics
  const wordCountChange =
    newAnalysis.overallMetrics.wordCount -
    originalAnalysis.overallMetrics.wordCount;
  const complexityChange =
    newAnalysis.structuralComparison.sentenceComplexity.score -
    originalAnalysis.structuralComparison.sentenceComplexity.score;

  // Add growth metrics to the new analysis
  return {
    ...newAnalysis,
    overallMetrics: {
      ...newAnalysis.overallMetrics,
      growthMetrics: {
        wordCountChange,
        complexityChange,
      },
    },
  };
}

/**
 * Analyze a document from the database
 */
export async function analyzeDocumentById(
  documentId: string,
  prisma: any
): Promise<TextAnalysis> {
  // Fetch document from database
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Analyze the document content
  return analyzeText(document.content);
}

/**
 * Generate word-level suggestions for a document
 */
export async function generateWordSuggestions(
  documentId: string,
  userId: string,
  prisma: any
) {
  // Fetch document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const words = document.content.split(/\s+/);
  const suggestions = [];

  // Use AI to generate word-level suggestions
  const prompt = `
  You are an expert writing coach. For the following text, identify 5-10 words that could be improved 
  or replaced with better alternatives. Consider academic tone, precision, and clarity.
  
  TEXT:
  ${document.content}
  
  For each word you identify, provide:
  1. The original word
  2. Your suggested replacement
  3. The confidence in your suggestion (0-1)
  4. A brief explanation for why this is better
  
  Return ONLY a JSON array of objects with these properties.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert writing coach producing JSON output only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const jsonString = completion.choices[0].message.content?.trim() || "[]";
    const wordSuggestions = JSON.parse(jsonString);

    // Process each suggestion and find its position in the text
    for (const suggestion of wordSuggestions) {
      const { originalWord, suggestedWord, confidence, explanation } =
        suggestion;

      // Find word positions
      let currentPosition = 0;
      const content = document.content;

      const regex = new RegExp(`\\b${originalWord}\\b`, "g");
      let match;

      while ((match = regex.exec(content)) !== null) {
        const startOffset = match.index;
        const endOffset = startOffset + originalWord.length;
        const contextStart = Math.max(0, startOffset - 15);
        const contextEnd = Math.min(content.length, endOffset + 15);
        const context = content.substring(contextStart, contextEnd);

        // Create the suggestion
        suggestions.push({
          documentId,
          userId,
          originalWord,
          suggestedWord,
          position: currentPosition,
          startOffset,
          endOffset,
          context,
          aiConfidence: confidence,
          highlighted: true,
          isAccepted: null,
        });

        currentPosition++;
      }
    }

    // Save suggestions to database
    await prisma.wordSuggestion.createMany({
      data: suggestions,
    });

    return suggestions;
  } catch (error) {
    console.error("Word suggestions error:", error);
    throw new Error("Failed to generate word suggestions");
  }
}
