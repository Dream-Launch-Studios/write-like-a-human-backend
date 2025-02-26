// src/controllers/feedbackController.ts
import { Request, Response } from "express";
import { Feedback, Comment } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";

// Helper functions
const checkDocumentAccess = async (
  userId: string,
  documentId: string | null
): Promise<boolean> => {
  if (!documentId) return false;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { group: true },
  });

  if (!document) return false;
  if (document.userId === userId) return true;

  if (document.groupId) {
    const group = await prisma.group.findFirst({
      where: {
        id: document.groupId,
        OR: [{ adminId: userId }, { members: { some: { userId } } }],
      },
    });
    return !!group;
  }

  return false;
};

const checkFeedbackOwnership = async (
  userId: string,
  feedbackId: string
): Promise<boolean> => {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });
  return feedback?.userId === userId;
};

// Feedback Controllers
export const createFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { documentId, content, status } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        content,
        status: (status || "PENDING") as "PENDING" | "ANALYZED" | "REVIEWED",
        documentId,
        userId: req.user.id,
        groupId: document.groupId,
      },
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        document: { select: { id: true, title: true } },
      },
    });

    if (!feedback || !feedback.documentId) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    if (!(await checkDocumentAccess(req.user.id, feedback.documentId))) {
      return res.status(403).json({ error: "No access to feedback" });
    }

    res.status(200).json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { content, status } = req.body;
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
    });

    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    if (
      !(await checkFeedbackOwnership(req.user.id, req.params.id)) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: req.params.id },
      data: { content, status },
    });

    res.status(200).json(updatedFeedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFeedback = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
    });

    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    if (
      !(await checkFeedbackOwnership(req.user.id, req.params.id)) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { feedbackId: req.params.id } }),
      prisma.feedback.delete({ where: { id: req.params.id } }),
    ]);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeedbackComments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
    });

    if (!feedback) return res.status(404).json({ error: "Feedback not found" });
    if (!(await checkDocumentAccess(req.user.id, feedback.documentId))) {
      return res.status(403).json({ error: "No access to comments" });
    }

    const comments = await prisma.comment.findMany({
      where: { feedbackId: req.params.id },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      include: { document: true },
    });

    if (!feedback || !feedback.documentId) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        feedbackId: req.params.id,
        userId: req.user.id,
        documentId: feedback.documentId,
      },
    });

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
