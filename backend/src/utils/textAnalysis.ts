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
  improvedVersion: {
    text: string;
    explanationOfChanges: string[];
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
        content: `You are an expert writing analyst and academic writing coach. Analyze the text and return ONLY a valid JSON object with no additional text or formatting. Follow this exact structure:

{
  "structuralAnalysis": {
    "sentenceComplexity": {
      "score": 85,
      "avgLength": 15.5,
      "structures": {"simple": 40, "compound": 35, "complex": 25}
    },
    "paragraphStructure": {
      "score": 80,
      "organization": "Well-structured",
      "transitions": "Smooth",
      "flow": "Logical"
    },
    "formatting": {
      "score": 75,
      "headingConsistency": "Consistent",
      "sectioning": "Clear"
    }
  },
  "vocabularyAnalysis": {
    "lexicalDiversity": {
      "score": 90,
      "typeTokenRatio": 0.75,
      "uniqueWords": 450
    },
    "wordFrequency": {
      "score": 85,
      "commonWords": ["word1", "word2"],
      "repetitions": {"word1": 5}
    },
    "academicTone": {
      "score": 88,
      "tone": "Formal",
      "sophistication": "Advanced"
    }
  },
  "styleAnalysis": {
    "readability": {
      "score": 82,
      "fleschKincaid": 12.5,
      "smog": 11.8
    },
    "voice": {
      "score": 85,
      "passiveCount": 12,
      "activeCount": 45
    },
    "perspective": {
      "score": 90,
      "pointOfView": "Third-person"
    }
  },
  "grammarAnalysis": {
    "punctuation": {
      "score": 95,
      "frequency": {"commas": 45},
      "usage": "Appropriate"
    },
    "patterns": {
      "score": 88,
      "errors": ["none"],
      "tendencies": ["complex"]
    },
    "spelling": {
      "score": 98,
      "variations": ["US English"],
      "consistency": "High"
    }
  },
  "thematicAnalysis": {
    "keyThemes": {
      "score": 85,
      "themes": ["theme1"],
      "focus": "Clear"
    },
    "keywordFrequency": {
      "score": 85,
      "keywords": {"key1": 5}
    },
    "development": {
      "score": 82,
      "structure": "Well-developed",
      "progression": "Logical"
    }
  },
  "similarityMetrics": {
    "nGramAnalysis": {
      "score": 85,
      "patterns": ["pattern1"],
      "consistency": "High"
    },
    "tfIdfScore": 0.75,
    "jaccardSimilarity": 0.8
  },
  "aiDetection": {
    "originalityScore": 92,
    "predictabilityScore": 85,
    "humanLikeScore": 90,
    "flags": ["natural"]
  },
  "feedback": {
    "strengths": ["strength1"],
    "improvements": ["improvement1"],
    "recommendations": ["recommendation1"]
  },
  "improvedVersion": {
    "text": "Improved text here",
    "explanationOfChanges": ["change1"]
  }
}`,
      },
      {
        role: "user",
        content: `Analyze this text and return ONLY a valid JSON object: ${text}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 3000,
  });

  try {
    let jsonString = completion.choices[0].message.content?.trim() || "{}";
    // Remove any potential markdown code block syntax
    jsonString = jsonString.replace(/```json\n?|\n?```/g, "");
    const analysisResult = JSON.parse(jsonString);

    // Map the response to our interface structure
    return {
      structuralComparison: {
        sentenceComplexity: {
          score: analysisResult.structuralAnalysis.sentenceComplexity.score,
          avgLength:
            analysisResult.structuralAnalysis.sentenceComplexity.avgLength,
          structures:
            analysisResult.structuralAnalysis.sentenceComplexity.structures,
        },
        paragraphStructure: {
          score: analysisResult.structuralAnalysis.paragraphStructure.score,
          organization:
            analysisResult.structuralAnalysis.paragraphStructure.organization,
          transitions:
            analysisResult.structuralAnalysis.paragraphStructure.transitions,
          flow: analysisResult.structuralAnalysis.paragraphStructure.flow,
        },
        formatting: {
          score: analysisResult.structuralAnalysis.formatting.score,
          headingConsistency:
            analysisResult.structuralAnalysis.formatting.headingConsistency,
          sectioning: analysisResult.structuralAnalysis.formatting.sectioning,
        },
      },
      vocabularyChoice: {
        lexicalDiversity: {
          score: analysisResult.vocabularyAnalysis.lexicalDiversity.score,
          typeTokenRatio:
            analysisResult.vocabularyAnalysis.lexicalDiversity.typeTokenRatio,
          uniqueWords:
            analysisResult.vocabularyAnalysis.lexicalDiversity.uniqueWords,
        },
        wordFrequency: {
          score: analysisResult.vocabularyAnalysis.wordFrequency.score,
          commonWords:
            analysisResult.vocabularyAnalysis.wordFrequency.commonWords,
          repetitions:
            analysisResult.vocabularyAnalysis.wordFrequency.repetitions,
        },
        academicLanguage: {
          score: analysisResult.vocabularyAnalysis.academicTone.score,
          tone: analysisResult.vocabularyAnalysis.academicTone.tone,
          sophistication:
            analysisResult.vocabularyAnalysis.academicTone.sophistication,
        },
      },
      writingStyle: {
        readabilityScores: {
          fleschKincaid: analysisResult.styleAnalysis.readability.fleschKincaid,
          smog: analysisResult.styleAnalysis.readability.smog,
          overall: analysisResult.styleAnalysis.readability.score,
        },
        voiceAnalysis: {
          score: analysisResult.styleAnalysis.voice.score,
          passiveCount: analysisResult.styleAnalysis.voice.passiveCount,
          activeCount: analysisResult.styleAnalysis.voice.activeCount,
        },
        perspective: {
          score: analysisResult.styleAnalysis.perspective.score,
          pointOfView: analysisResult.styleAnalysis.perspective.pointOfView,
        },
        descriptiveLanguage: {
          score: 0,
          dialogueUsage: "",
          techniques: [],
        },
      },
      grammarMechanics: {
        punctuation: {
          score: analysisResult.grammarAnalysis.punctuation.score,
          frequency: analysisResult.grammarAnalysis.punctuation.frequency,
          usage: analysisResult.grammarAnalysis.punctuation.usage,
        },
        grammarPatterns: {
          score: analysisResult.grammarAnalysis.patterns.score,
          errors: analysisResult.grammarAnalysis.patterns.errors,
          tendencies: analysisResult.grammarAnalysis.patterns.tendencies,
        },
        spelling: {
          score: analysisResult.grammarAnalysis.spelling.score,
          variations: analysisResult.grammarAnalysis.spelling.variations,
          consistency: analysisResult.grammarAnalysis.spelling.consistency,
        },
      },
      thematicElements: {
        keyThemes: {
          score: analysisResult.thematicAnalysis.keyThemes.score,
          themes: analysisResult.thematicAnalysis.keyThemes.themes,
          focus: analysisResult.thematicAnalysis.keyThemes.focus,
        },
        keywordFrequency: {
          score: analysisResult.thematicAnalysis.keywordFrequency.score,
          keywords: analysisResult.thematicAnalysis.keywordFrequency.keywords,
        },
        argumentDevelopment: {
          score: analysisResult.thematicAnalysis.development.score,
          structure: analysisResult.thematicAnalysis.development.structure,
          progression: analysisResult.thematicAnalysis.development.progression,
        },
      },
      similarityMetrics: {
        nGramAnalysis: {
          score: analysisResult.similarityMetrics.nGramAnalysis.score,
          patterns: analysisResult.similarityMetrics.nGramAnalysis.patterns,
          consistency:
            analysisResult.similarityMetrics.nGramAnalysis.consistency,
        },
        tfIdfScore: analysisResult.similarityMetrics.tfIdfScore,
        jaccardSimilarity: analysisResult.similarityMetrics.jaccardSimilarity,
      },
      aiDetection: {
        originalityScore: analysisResult.aiDetection.originalityScore,
        predictabilityScore: analysisResult.aiDetection.predictabilityScore,
        humanLikeScore: analysisResult.aiDetection.humanLikeScore,
        flags: analysisResult.aiDetection.flags,
      },
      feedback: {
        strengths: analysisResult.feedback.strengths,
        improvements: analysisResult.feedback.improvements,
        recommendations: analysisResult.feedback.recommendations,
      },
      improvedVersion: {
        text: analysisResult.improvedVersion.text,
        explanationOfChanges:
          analysisResult.improvedVersion.explanationOfChanges,
      },
    };
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("Failed to parse AI analysis response");
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
