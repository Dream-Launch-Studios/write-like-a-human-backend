import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";
import {
  analyzeText,
  compareTexts,
  analyzeDocumentById,
  generateWordSuggestions,
} from "../utils/textAnalysis";

/**
 * Analyze raw text submitted by user
 */
export const analyzeRawText = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid text content is required",
      });
    }

    // Get comprehensive analysis
    const analysis = await analyzeText(text);

    // Return analysis with success status
    res.status(200).json({
      success: true,
      analysis,
      message: "Text analysis completed successfully",
    });
  } catch (error: any) {
    console.error("Error in text analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Analyze a document from the database
 */
export const analyzeDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate access permissions
    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or access denied",
      });
    }

    // Get comprehensive analysis
    const analysis = await analyzeDocumentById(id, prisma);

    // Return analysis with success status
    res.status(200).json({
      success: true,
      analysis,
      documentInfo: {
        id: document.id,
        title: document.title,
        version: document.versionNumber,
      },
      message: "Document analysis completed successfully",
    });
  } catch (error: any) {
    console.error("Error in document analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Compare two versions of a document
 */
export const compareDocumentVersions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { documentId, compareWithId } = req.body;
    const userId = req.user.id;

    // Validate document IDs
    if (!documentId || !compareWithId) {
      return res.status(400).json({
        success: false,
        error: "Both document IDs are required",
      });
    }

    // Fetch both documents
    const document1 = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    const document2 = await prisma.document.findFirst({
      where: {
        id: compareWithId,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!document1 || !document2) {
      return res.status(404).json({
        success: false,
        error: "One or both documents not found or access denied",
      });
    }

    // Compare the documents
    const comparisonAnalysis = await compareTexts(
      document1.content,
      document2.content
    );

    // Return comparison with success status
    res.status(200).json({
      success: true,
      comparison: comparisonAnalysis,
      documentInfo: {
        original: {
          id: document1.id,
          title: document1.title,
          version: document1.versionNumber,
        },
        comparison: {
          id: document2.id,
          title: document2.title,
          version: document2.versionNumber,
        },
      },
      message: "Document comparison completed successfully",
    });
  } catch (error: any) {
    console.error("Error in document comparison:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Generate word-level suggestions for a document
 */
export const generateDocumentSuggestions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate document access
    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or access denied",
      });
    }

    // Generate word suggestions
    const suggestions = await generateWordSuggestions(id, userId, prisma);

    // Return suggestions with success status
    res.status(200).json({
      success: true,
      suggestions,
      documentInfo: {
        id: document.id,
        title: document.title,
      },
      message: "Word suggestions generated successfully",
    });
  } catch (error: any) {
    console.error("Error generating word suggestions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Save feedback from the analysis
 */
export const saveFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { documentId, content, aiScore } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!documentId || !content) {
      return res.status(400).json({
        success: false,
        error: "Document ID and feedback content are required",
      });
    }

    // Check document access
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { userId },
          {
            group: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or access denied",
      });
    }

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        content,
        aiScore: aiScore || null,
        status: "ANALYZED",
        userId,
        documentId: document.id,
        groupId: document.groupId,
      },
    });

    // Return success response
    res.status(201).json({
      success: true,
      feedback,
      message: "Feedback saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving feedback:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
