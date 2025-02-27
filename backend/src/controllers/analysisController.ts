import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";
import { textAnalysisPrompt, documentAnalysisPrompt } from "../utils/prompts";
import { analyzeText } from "../utils/textAnalysis";

export const analyzeRawText = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text content is required" });
    }

    const analysis = await analyzeText(text);

    res.status(200).json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { text } = req.body;
    const analysis = await analyzeText(text);

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
