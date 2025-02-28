"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Self-executing async function to test AI
(async () => {
    try {
        const sampleText = `
      The impact of artificial intelligence on modern society is profound. 
      AI technologies are transforming various sectors, including healthcare, 
      education, and transportation. However, this rapid advancement also 
      raises important ethical considerations that need to be carefully addressed.
    `;
        console.log("\n=== Testing OpenAI Analysis ===");
        console.log("Input Text:", sampleText);
        // For text analysis, you can use these models:
        // 1. gpt-4 (most capable, but expensive)
        // 2. gpt-3.5-turbo-16k (good for longer texts)
        // 3. text-davinci-003 (focused on text completion)
        // 4. gpt-3.5-turbo (good balance of capability and cost)
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    role: "system",
                    content: `You are an expert writing analyst. Analyze the text and provide scores and detailed feedback in this exact JSON format:
{
  "structural": {
    "sentenceComplexity": {
      "score": 85,
      "avgLength": 20,
      "details": ["Distribution of simple/compound/complex sentences", "Syntactic variety"],
      "structures": {
        "simple": 40,
        "compound": 35,
        "complex": 25
      }
    },
    "paragraphStructure": {
      "score": 80,
      "details": ["Organization quality", "Transition effectiveness", "Logical flow"]
    },
    "formatting": {
      "score": 75,
      "details": ["Heading consistency", "Section organization"]
    }
  },
  "vocabulary": {
    "lexicalDiversity": {
      "score": 85,
      "typeTokenRatio": 0.75,
      "details": ["Unique word usage", "Vocabulary richness"]
    },
    "wordFrequency": {
      "commonWords": ["word1", "word2", "word3"],
      "repetitionPatterns": ["Frequently repeated phrases"]
    },
    "academicTone": {
      "score": 90,
      "details": ["Formality level", "Technical terminology", "Sophistication"]
    }
  },
  "style": {
    "readability": {
      "score": 82,
      "fleschKincaid": 65,
      "smog": 12,
      "details": ["Reading level assessment", "Sentence complexity balance"]
    },
    "voiceAnalysis": {
      "score": 88,
      "activeVsPassive": "70:30",
      "details": ["Voice consistency", "Construction patterns"]
    },
    "perspective": {
      "score": 85,
      "pointOfView": "Third Person",
      "details": ["Narrative consistency", "Perspective shifts"]
    }
  },
  "grammar": {
    "punctuation": {
      "score": 90,
      "frequency": {
        "commas": 12,
        "semicolons": 2,
        "colons": 1
      },
      "details": ["Usage patterns", "Correctness"]
    },
    "patterns": {
      "score": 85,
      "errors": ["List of any grammar issues"],
      "details": ["Common patterns", "Stylistic choices"]
    },
    "spelling": {
      "score": 95,
      "variations": ["List of spelling variations"],
      "details": ["Consistency check", "Style conventions"]
    }
  },
  "thematic": {
    "keyThemes": {
      "score": 85,
      "themes": ["Main topic 1", "Main topic 2"],
      "details": ["Theme development", "Focus consistency"]
    },
    "keywordFrequency": {
      "score": 80,
      "keywords": {
        "word1": 5,
        "word2": 3
      }
    },
    "argumentDevelopment": {
      "score": 85,
      "details": ["Logic flow", "Idea progression", "Supporting evidence"]
    }
  },
  "aiDetection": {
    "originalityScore": 85,
    "predictabilityScore": 75,
    "humanLikeScore": 80,
    "details": ["Writing pattern analysis", "AI indicators"]
  },
  "metrics": {
    "wordCount": 150,
    "sentenceCount": 8,
    "avgWordsPerSentence": 18.75
  }
}

IMPORTANT: All scores must be integers between 0-100. Provide detailed analysis for each category.`,
                },
                {
                    role: "user",
                    content: sampleText,
                },
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });
        console.log("\nAI Analysis Result:");
        const result = JSON.parse(completion.choices[0].message.content || "{}");
        console.log("\nStructural Analysis:");
        console.log(`Sentence Complexity: ${result.structural.sentenceComplexity.score}/100`);
        console.log(`Paragraph Structure: ${result.structural.paragraphStructure.score}/100`);
        console.log(`Formatting: ${result.structural.formatting.score}/100`);
        console.log("\nVocabulary Analysis:");
        console.log(`Lexical Diversity: ${result.vocabulary.lexicalDiversity.score}/100`);
        console.log(`Academic Tone: ${result.vocabulary.academicTone.score}/100`);
        console.log("Common Words:", result.vocabulary.wordFrequency.commonWords.join(", "));
        // You can also try the embeddings API for semantic analysis
        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: sampleText,
        });
        console.log("\nText Embedding Score:", embedding.data[0].embedding.slice(0, 5), "...");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
})();
