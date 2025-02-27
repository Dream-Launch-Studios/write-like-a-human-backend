"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("./prompts");
// Self-executing async function to test AI
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test text to analyze
        const sampleText = `
      The impact of artificial intelligence on modern society is profound. 
      AI technologies are transforming various sectors, including healthcare, 
      education, and transportation. However, this rapid advancement also 
      raises important ethical considerations that need to be carefully addressed.
      
      First, there are concerns about privacy and data security. 
      As AI systems become more sophisticated, they require vast amounts 
      of data to function effectively. This creates potential risks for 
      personal information protection and data misuse.
    `;
        // Basic text metrics
        const wordCount = sampleText.trim().split(/\s+/).length;
        const sentenceCount = sampleText.split(/[.!?]+\s/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;
        // Complexity analysis
        const complexWords = sampleText
            .split(/\s+/)
            .filter((word) => word.length > 6).length;
        const complexityScore = (complexWords / wordCount) * 100;
        // Test both raw text and document analysis
        console.log("\n=== Testing Text Analysis ===");
        console.log("Input Text:", sampleText);
        console.log("\nBasic Metrics:");
        console.log("- Word Count:", wordCount);
        console.log("- Sentence Count:", sentenceCount);
        console.log("- Average Words per Sentence:", avgWordsPerSentence.toFixed(1));
        console.log("- Complex Words:", complexWords);
        console.log("- Complexity Score:", complexityScore.toFixed(1) + "%");
        // Generate feedback
        const feedback = [];
        if (avgWordsPerSentence > 20) {
            feedback.push("⚠️ Long sentences detected");
        }
        if (complexityScore > 20) {
            feedback.push("⚠️ High complexity score");
        }
        if (wordCount < 100) {
            feedback.push("⚠️ Text might be too short");
        }
        console.log("\nFeedback:", feedback.length ? feedback : ["✅ Text looks good"]);
        // Test prompts
        console.log("\n=== Testing Prompts ===");
        console.log("Text Analysis Prompt Sample:");
        console.log(prompts_1.textAnalysisPrompt + sampleText.substring(0, 100) + "...");
        console.log("\nDocument Analysis Prompt Sample:");
        console.log(prompts_1.documentAnalysisPrompt + sampleText.substring(0, 100) + "...");
    }
    catch (error) {
        console.error("❌ Test failed:", error);
    }
}))();
