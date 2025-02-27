import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TextMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  complexWords: number;
  complexityScore: number;
  typeTokenRatio: number;
  passiveVoiceCount: number;
  readabilityScore: number;
}

interface AnalysisResult {
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
}

export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    // Basic text cleaning
    const cleanText = text.trim().replace(/\s+/g, " ");
    const words = cleanText.split(/\s+/);
    const sentences = cleanText.split(/[.!?]+\s/).filter(Boolean);

    // Calculate basic metrics
    const metrics = calculateTextMetrics(cleanText);

    // Get AI analysis
    const aiAnalysis = await getAIAnalysis(cleanText);

    // Combine all analyses
    return {
      ...aiAnalysis,
      overallMetrics: {
        wordCount: words.length,
        sentenceCount: sentences.length,
      },
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze text");
  }
}

function calculateTextMetrics(text: string): TextMetrics {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+\s/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: words.length / sentences.length,
    complexWords: words.filter((w) => w.length > 6).length,
    complexityScore:
      (words.filter((w) => w.length > 6).length / words.length) * 100,
    typeTokenRatio: uniqueWords.size / words.length,
    passiveVoiceCount: countPassiveVoice(text),
    readabilityScore: calculateReadabilityScore(text),
  };
}

async function getAIAnalysis(
  text: string
): Promise<Omit<AnalysisResult, "metrics" | "overallMetrics">> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: `Analyze the text and return a JSON response with numerical scores and feedback:

{
  "scores": {
    "grammar": {
      "score": 85,  // 0-100 score for grammar and syntax
      "details": ["Good sentence structure", "Minor punctuation issues"]
    },
    "clarity": {
      "score": 75,  // 0-100 score for clarity and coherence
      "details": ["Clear main points", "Needs more examples"]
    },
    "structure": {
      "score": 80,  // 0-100 score for organization
      "details": ["Good paragraph flow", "Needs better transitions"]
    },
    "vocabulary": {
      "score": 90,  // 0-100 score for word choice
      "details": ["Strong academic tone", "Varied vocabulary"]
    },
    "overall": {
      "score": 82,  // Average of all scores
      "strengths": ["point1", "point2"],
      "improvements": ["point1", "point2"],
      "recommendations": ["point1", "point2"]
    }
  }
}

IMPORTANT: All scores must be integers between 0-100. Provide specific details for each category.`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  try {
    const analysisResult = JSON.parse(
      completion.choices[0].message.content || "{}"
    );
    // Map the JSON response to our interface structure
    return {
      structuralComparison: {
        sentenceComplexity: {
          score: analysisResult.structuralAnalysis.sentenceComplexity,
          avgLength: 0,
          structures: { simple: 0, compound: 0, complex: 0 },
        },
        paragraphStructure: {
          score: analysisResult.structuralAnalysis.paragraphStructure,
          organization: "",
          transitions: "",
          flow: "",
        },
        formatting: {
          score: analysisResult.structuralAnalysis.formatting,
          headingConsistency: "",
          sectioning: "",
        },
      },
      vocabularyChoice: {
        lexicalDiversity: {
          score: analysisResult.vocabularyAnalysis.lexicalDiversity,
          typeTokenRatio: 0,
          uniqueWords: 0,
        },
        wordFrequency: {
          score: 0,
          commonWords: [],
          repetitions: {},
        },
        academicLanguage: {
          score: analysisResult.vocabularyAnalysis.academicTone,
          tone: "",
          sophistication: "",
        },
      },
      writingStyle: {
        readabilityScores: {
          fleschKincaid: 0,
          smog: 0,
          overall: 0,
        },
        voiceAnalysis: {
          score: 0,
          passiveCount: 0,
          activeCount: 0,
        },
        perspective: {
          score: analysisResult.styleAnalysis.perspective,
          pointOfView: "",
        },
        descriptiveLanguage: {
          score: 0,
          dialogueUsage: "",
          techniques: [],
        },
      },
      grammarMechanics: {
        punctuation: {
          score: analysisResult.grammarAnalysis.punctuation,
          frequency: {},
          usage: "",
        },
        grammarPatterns: {
          score: 0,
          errors: [],
          tendencies: [],
        },
        spelling: {
          score: analysisResult.grammarAnalysis.spelling,
          variations: [],
          consistency: "",
        },
      },
      thematicElements: {
        keyThemes: {
          score: 0,
          themes: [],
          focus: "",
        },
        keywordFrequency: {
          score: 0,
          keywords: {},
        },
        argumentDevelopment: {
          score: 0,
          structure: "",
          progression: "",
        },
      },
      similarityMetrics: {
        nGramAnalysis: {
          score: 0,
          patterns: [],
          consistency: "",
        },
        tfIdfScore: 0,
        jaccardSimilarity: 0,
      },
      aiDetection: {
        originalityScore: 0,
        predictabilityScore: 0,
        humanLikeScore: 0,
        flags: [],
      },
      feedback: {
        strengths: [],
        improvements: [],
        recommendations: [],
      },
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to analyze text");
  }
}

function countPassiveVoice(text: string): number {
  // Implement passive voice detection
  return 0;
}

function calculateReadabilityScore(text: string): number {
  // Implement readability scoring
  return 0;
}

// Additional helper functions for specific analyses
