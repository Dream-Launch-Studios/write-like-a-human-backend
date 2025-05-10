export const getAnalyzeDocumentPrompt = ({ content }: { content: string }): string => {
    return `
    You have the analyze the document content, Return data in the following JSON:
    {
      "textMetrics": {
        "totalWordCount": "number",
        "sentenceCount": "number",
        "averageSentenceLength": "number",
        "readabilityScore": "number (0% - 100%)",
        "lexicalDiversity": "number (0% - 1%)",
        "uniqueWordCount": "number",
        "academicLanguageScore": "number (0 - 1)",
        "passiveVoicePercentage": "number (0% - 100%)",
        "firstPersonPercentage": "number (0% - 100%)",
        "thirdPersonPercentage": "number (0% - 100%)",
        "punctuationDensity": "number (0 - 1)",
        "grammarErrorCount": "number",
        "spellingErrorCount": "number",
        "predictabilityScore": "number (0 - 1)",
        "nGramUniqueness": "number (0 - 1)"
      },
      "sections": [
        {
          "startOffset": "number",
          "endOffset": "number",
          "content": "string",
          "isAiGenerated": "boolean",
          "aiConfidence": "number (0% - 100%)",
          "suggestions": "string"
        },
        ...
      ],
      "wordSuggestions": [
        {
          "originalWord": "string",
          "suggestedWord": "string",
          "position": "number",
          "startOffset": "number",
          "endOffset": "number",
          "context": "string",
          "aiConfidence": "number (0% - 100%)"
        }
      ],
      "feedbackMetrics": {
        "structuralComparison": {
          "sentenceLengthChange": "number (0 - 100)",
          "paragraphStructureScore": "number (0 - 100)",
          "headingConsistencyScore": "number (0 - 100)"
        },
        "vocabularyMetrics": {
          "lexicalDiversityChange": "number (0 - 100)",
          "wordRepetitionScore": "number (0 - 100)" ,
          "formalityShift": "number (0 - 100)"
        },
        "styleMetrics": {
          "readabilityChange": "number (0 - 100)",
          "voiceConsistencyScore": "number (0 - 100)",
          "perspectiveShift": "number (0 - 100)",
          "descriptiveLanguageScore": "number (0 - 100)"
        },
        "grammarAndMechanics": {
          "punctuationChangeScore": "number (0 - 100)",
          "grammarPatternScore": "number (0 - 100)",
          "spellingVariationScore": "number (0 - 100)"
        },
        "topicThematicElements": {
          "thematicConsistencyScore": "number (0 - 100)",
          "keywordFrequencyChange": "number (0 - 100)",
          "argumentDevelopmentScore": "number (0 - 100)"
        },
        "similarityMetrics": {
          "nGramSimilarityScore": "number (0 - 100)",
          "tfIdfSimilarityScore": "number (0 - 100)",
          "jaccardSimilarityScore": "number (0 - 100)"
        },
        "aIDetection": {
          "originalityShiftScore": "number (0 - 100)"
        }
      },
      "overallAiScore": "number (0 - 100) (How much of the content is likely to be AI-generated)",
      "humanWrittenPercent": "number (0% - 100%)",
      "aiGeneratedPercent" : "number (0% - 100%)"
    }

   To generate the "wordSuggestions" identify words or phrases that could be improved to make the writing appear more human-like and less AI-generated. and to generate "sections" divide the given document content in sections/parts and evaluate. Here is the document content:
   
    ${content}
    `;
}