import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { analyzeSubmission } from "../services/aiService";
import { ApiError, AuthRequest } from "../types";

export const createSubmission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content, rubricId } = req.body;
    const userId = req.user!.id;

    // Analyze the submission using AI
    const analysis = await analyzeSubmission(content);

    const submission = await prisma.submission.create({
      data: {
        title,
        content,
        userId,
        rubricId,
        aiScore: analysis.aiScore,
        feedback: analysis.feedback,
        status: "ANALYZED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rubric: true,
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

export const getSubmission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        rubric: true,
      },
    });

    if (!submission) {
      const error: ApiError = new Error("Submission not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(submission);
  } catch (error) {
    next(error);
  }
};
