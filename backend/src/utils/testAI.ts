import { analyzeText } from "./textAnalysis";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAIAnalysis() {
  console.log("\n=== Testing OpenAI Analysis ===");

  const inputText = `
    Gumroad is an e-commerce platform that allows creators to sell products directly to their audience. The platform was founded by Sahil Lavingia in 2011 and is based in San Francisco, California. Gumroad enables creators to sell digital products, such as e-books, music, videos, software, and physical goods. The platform provides creators with tools to create custom landing pages, track sales, and process payments. Gumroad's primary focus is serving independent creators, such as writers, musicians, and designers, who want to sell their products without going through intermediaries.
  `;

  console.log("Input Text:", inputText.trim(), "\n");

  try {
    const analysis = await analyzeText(inputText);

    console.log("=== Detailed Analysis ===\n");

    // Structural Comparison
    console.log("1. Structural Comparison");
    console.log(
      `Sentence Complexity Score: ${analysis.structuralComparison.sentenceComplexity.score}/100`
    );
    console.log(
      `Average Sentence Length: ${analysis.structuralComparison.sentenceComplexity.avgLength}`
    );
    console.log(
      "Sentence Structures:",
      analysis.structuralComparison.sentenceComplexity.structures
    );
    console.log(
      `Paragraph Structure Score: ${analysis.structuralComparison.paragraphStructure.score}/100`
    );
    console.log(
      `Formatting Score: ${analysis.structuralComparison.formatting.score}/100\n`
    );

    // Vocabulary & Word Choice
    console.log("2. Vocabulary Analysis");
    console.log(
      `Lexical Diversity Score: ${analysis.vocabularyChoice.lexicalDiversity.score}/100`
    );
    console.log(
      `Type-Token Ratio: ${analysis.vocabularyChoice.lexicalDiversity.typeTokenRatio}`
    );
    console.log(
      `Academic Language Score: ${analysis.vocabularyChoice.academicLanguage.score}/100`
    );
    console.log(
      "Common Words:",
      analysis.vocabularyChoice.wordFrequency.commonWords.join(", "),
      "\n"
    );

    // Writing Style
    console.log("3. Writing Style");
    console.log(
      `Readability Score: ${analysis.writingStyle.readabilityScores.overall}/100`
    );
    console.log(
      `Flesch-Kincaid: ${analysis.writingStyle.readabilityScores.fleschKincaid}`
    );
    console.log(`SMOG: ${analysis.writingStyle.readabilityScores.smog}`);
    console.log(
      `Voice Analysis Score: ${analysis.writingStyle.voiceAnalysis.score}/100`
    );
    console.log(
      `Active vs Passive: ${analysis.writingStyle.voiceAnalysis.activeCount}:${analysis.writingStyle.voiceAnalysis.passiveCount}\n`
    );

    // Grammar & Mechanics
    console.log("4. Grammar Analysis");
    console.log(
      `Punctuation Score: ${analysis.grammarMechanics.punctuation.score}/100`
    );
    console.log(
      "Punctuation Frequency:",
      analysis.grammarMechanics.punctuation.frequency
    );
    console.log(
      `Grammar Pattern Score: ${analysis.grammarMechanics.grammarPatterns.score}/100`
    );
    console.log(
      `Spelling Score: ${analysis.grammarMechanics.spelling.score}/100\n`
    );

    // Thematic Elements
    console.log("5. Thematic Analysis");
    console.log(
      `Theme Score: ${analysis.thematicElements.keyThemes.score}/100`
    );
    console.log(
      "Key Themes:",
      analysis.thematicElements.keyThemes.themes.join(", ")
    );
    console.log(
      `Argument Development Score: ${analysis.thematicElements.argumentDevelopment.score}/100\n`
    );

    // AI Detection
    console.log("6. AI Detection");
    console.log(
      `Originality Score: ${analysis.aiDetection.originalityScore}/100`
    );
    console.log(`Human-like Score: ${analysis.aiDetection.humanLikeScore}/100`);
    console.log(
      `Predictability Score: ${analysis.aiDetection.predictabilityScore}/100`
    );
    console.log("AI Flags:", analysis.aiDetection.flags.join(", "), "\n");

    // Overall Metrics
    console.log("7. Text Metrics");
    console.log(`Word Count: ${analysis.overallMetrics.wordCount}`);
    console.log(`Sentence Count: ${analysis.overallMetrics.sentenceCount}\n`);

    // Feedback
    console.log("8. Feedback");
    console.log("Strengths:");
    analysis.feedback.strengths.forEach((s) => console.log(`- ${s}`));
    console.log("\nAreas for Improvement:");
    analysis.feedback.improvements.forEach((i) => console.log(`- ${i}`));
    console.log("\nRecommendations:");
    analysis.feedback.recommendations.forEach((r) => console.log(`- ${r}`));
  } catch (error) {
    console.error("Analysis Error:", error);
  }
}

testAIAnalysis();
