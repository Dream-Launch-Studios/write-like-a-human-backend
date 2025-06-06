import { analyzeText } from "./textAnalysis";

/**
 * Test function to demonstrate the text analysis capabilities
 */
async function testAIAnalysis() {
  try {
    // Sample text to analyze
    const sampleText =
      "Gumroad is an e-commerce platform that allows creators to sell products directly to their audience. The platform was founded by Sahil Lavingia in 2011 and is based in San Francisco, California. Gumroad enables creators to sell digital products, such as e-books, music, videos, software, and physical goods. The platform provides creators with tools to create custom landing pages, track sales, and process payments.Gumroad's primary focus is serving independent creators, such as writers, musicians, and designers, who want to sell their products without going through intermediaries.";

    console.log("=== Testing OpenAI Analysis ===");
    console.log(
      `Input Text: ${sampleText.substring(0, 250)}${
        sampleText.length > 250 ? "..." : ""
      }`
    );

    // Get the analysis
    const analysis = await analyzeText(sampleText);

    // Print a detailed report
    console.log("=== Detailed Analysis ===");

    // 1. Structural Analysis
    console.log("1. Structural Comparison");
    console.log(
      `Sentence Complexity Score: ${analysis.structuralComparison.sentenceComplexity.score}/100`
    );
    console.log(
      `Average Sentence Length: ${analysis.structuralComparison.sentenceComplexity.avgLength.toFixed(
        0
      )}`
    );
    console.log("Sentence Structures:", {
      simple:
        analysis.structuralComparison.sentenceComplexity.structures.simple,
      compound:
        analysis.structuralComparison.sentenceComplexity.structures.compound,
      complex:
        analysis.structuralComparison.sentenceComplexity.structures.complex,
    });
    console.log(
      `Paragraph Structure Score: ${analysis.structuralComparison.paragraphStructure.score}/100`
    );
    console.log(
      `Formatting Score: ${analysis.structuralComparison.formatting.score}/100`
    );

    // 2. Vocabulary Analysis
    console.log("2. Vocabulary Analysis");
    console.log(
      `Lexical Diversity Score: ${analysis.vocabularyChoice.lexicalDiversity.score}/100`
    );
    console.log(
      `Type-Token Ratio: ${analysis.vocabularyChoice.lexicalDiversity.typeTokenRatio.toFixed(
        2
      )}`
    );
    console.log(
      `Academic Language Score: ${analysis.vocabularyChoice.academicLanguage.score}/100`
    );
    console.log(
      `Common Words: ${analysis.vocabularyChoice.wordFrequency.commonWords.join(
        ", "
      )} `
    );

    // 3. Writing Style
    console.log("3. Writing Style");
    console.log(
      `Readability Score: ${analysis.writingStyle.readabilityScores.overall}/100`
    );
    console.log(
      `Flesch-Kincaid: ${analysis.writingStyle.readabilityScores.fleschKincaid.toFixed(
        1
      )}`
    );
    console.log(
      `SMOG: ${analysis.writingStyle.readabilityScores.smog.toFixed(1)}`
    );
    console.log(
      `Voice Analysis Score: ${analysis.writingStyle.voiceAnalysis.score}/100`
    );
    console.log(
      `Active vs Passive: ${analysis.writingStyle.voiceAnalysis.activeCount}:${analysis.writingStyle.voiceAnalysis.passiveCount}`
    );

    // 4. Grammar Analysis
    console.log("4. Grammar Analysis");
    console.log(
      `Punctuation Score: ${analysis.grammarMechanics.punctuation.score}/100`
    );
    console.log("Punctuation Frequency:", {
      periods: Object.hasOwn(
        analysis.grammarMechanics.punctuation.frequency,
        "."
      )
        ? analysis.grammarMechanics.punctuation.frequency["."]
        : 0,
      commas: Object.hasOwn(
        analysis.grammarMechanics.punctuation.frequency,
        ","
      )
        ? analysis.grammarMechanics.punctuation.frequency[","]
        : 0,
    });
    console.log(
      `Grammar Pattern Score: ${analysis.grammarMechanics.grammarPatterns.score}/100`
    );
    console.log(
      `Spelling Score: ${analysis.grammarMechanics.spelling.score}/100`
    );

    // 5. Thematic Analysis
    console.log("5. Thematic Analysis");
    console.log(
      `Theme Score: ${analysis.thematicElements.keyThemes.score}/100`
    );
    console.log(
      `Key Themes: ${analysis.thematicElements.keyThemes.themes.join(", ")}`
    );
    console.log(
      `Argument Development Score: ${analysis.thematicElements.argumentDevelopment.score}/100`
    );

    // 6. AI Detection
    console.log("6. AI Detection");
    console.log(
      `Originality Score: ${analysis.aiDetection.originalityScore}/100`
    );
    console.log(`Human-like Score: ${analysis.aiDetection.humanLikeScore}/100`);
    console.log(
      `Predictability Score: ${analysis.aiDetection.predictabilityScore}/100`
    );
    console.log(`AI Flags: ${analysis.aiDetection.flags.join(", ")} `);

    // 7. Metrics
    console.log("7. Text Metrics");
    console.log(`Word Count: ${analysis.overallMetrics.wordCount}`);
    console.log(`Sentence Count: ${analysis.overallMetrics.sentenceCount}`);

    // 8. Feedback
    console.log("8. Feedback");
    console.log("Strengths:");
    analysis.feedback.strengths.forEach((s) => console.log(`- ${s}`));

    console.log("\nAreas for Improvement:");
    const areasForImprovement = analysis.feedback.improvements || [];
    areasForImprovement.forEach((i) => console.log(`- ${i}`));

    console.log("\nRecommendations:");
    analysis.feedback.recommendations.forEach((r) => console.log(`- ${r}`));

    // 9. Improved Version
    console.log("\n9. Improved Version");
    console.log(analysis.improvedVersion.text);

    console.log("\nExplanation of Changes:");
    analysis.improvedVersion.explanationOfChanges.forEach((e) =>
      console.log(`- ${e}`)
    );

    return analysis;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

// Run the test
testAIAnalysis().catch(console.error);
