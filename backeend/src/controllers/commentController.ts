// src/controllers/commentController.ts
import { Request, Response } from "express";
import { PrismaClient, Comment } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";
import { checkDocumentAccess } from "./documentController";

// Helper functions
const checkCommentOwnership = async (
  userId: string,
  commentId: string
): Promise<boolean> => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  return comment?.userId === userId;
};

// Comment Controllers
export const getComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
      include: {
        feedback: {
          include: { document: true },
        },
      },
    });

    if (!comment || !comment.feedback || !comment.feedback.documentId) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      !(await checkDocumentAccess(req.user.id, comment.feedback.documentId))
    ) {
      return res.status(403).json({ error: "No access to comment" });
    }

    res.status(200).json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { content } = req.body;
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (
      !(await checkCommentOwnership(req.user.id, req.params.id)) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { content },
    });

    res.status(200).json(updatedComment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
    });

    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (
      !(await checkCommentOwnership(req.user.id, req.params.id)) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.comment.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
