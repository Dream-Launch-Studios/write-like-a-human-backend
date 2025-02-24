import { Configuration, OpenAIApi } from "openai";
import { SubmissionAnalysis } from "../types";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function analyzeSubmission(
  content: string
): Promise<SubmissionAnalysis> {
  try {
    const prompt = `
      Analyze the following text and determine:
      1. How likely it is to be AI-generated (0-1 score)
      2. Specific feedback about writing style
      3. Suggestions for making it more human-like

      Text: ${content}
    `;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert writing analyst specializing in detecting AI-generated content and providing constructive feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const analysis = response.data.choices[0].message?.content;
    // Parse the analysis and structure it (you'll need to implement this based on the response format)

    return {
      aiScore: 0.5, // Parse from analysis
      feedback: "Detailed feedback here",
      suggestions: ["Suggestion 1", "Suggestion 2"],
    };
  } catch (error) {
    console.error("Error analyzing submission:", error);
    throw new Error("Failed to analyze submission");
  }
}
