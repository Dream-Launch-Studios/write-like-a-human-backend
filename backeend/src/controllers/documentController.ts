// src/controllers/documentController.ts
import { Request, Response } from "express";
import { PrismaClient, Document } from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";

export const checkDocumentAccess = async (
  userId: string,
  documentId: string
): Promise<boolean> => {
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

export const listDocuments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId: req.user.id,
        isLatest: true,
      },
      include: {
        group: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, content, groupId } = req.body;

    if (groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          OR: [
            { adminId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      });
      if (!group && req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json({ error: "Unauthorized to create document in this group" });
      }
    }

    const newDocument = await prisma.document.create({
      data: {
        title,
        content,
        groupId: groupId || null,
        userId: req.user.id,
        versionNumber: 1,
        isLatest: true,
        fileName: title,
        fileUrl: "",
        fileType: "text",
        fileSize: Buffer.from(content).length,
      },
    });
    res.status(201).json({ document: newDocument });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });
    if (
      req.user.role !== "ADMIN" &&
      !(await checkDocumentAccess(req.user.id, req.params.id))
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.status(200).json({ document });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, content } = req.body;
    const existingDocument = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!existingDocument)
      return res.status(404).json({ error: "Document not found" });

    let canEdit = false;
    if (req.user.role === "ADMIN") canEdit = true;
    else if (existingDocument.userId === req.user.id) canEdit = true;
    else if (existingDocument.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: existingDocument.groupId },
      });
      if (group?.adminId === req.user.id) canEdit = true;
    }

    if (!canEdit)
      return res.status(403).json({ error: "Unauthorized to edit document" });

    const newVersion = await prisma.$transaction([
      prisma.document.update({
        where: { id: req.params.id },
        data: { isLatest: false },
      }),
      prisma.document.create({
        data: {
          title: title || existingDocument.title,
          content: content || existingDocument.content,
          userId: req.user.id,
          groupId: existingDocument.groupId,
          versionNumber: existingDocument.versionNumber + 1,
          isLatest: true,
          parentDocumentId:
            existingDocument.parentDocumentId || existingDocument.id,
          fileName: title || existingDocument.fileName,
          fileUrl: existingDocument.fileUrl,
          fileType: existingDocument.fileType,
          fileSize: Buffer.from(content || existingDocument.content).length,
        },
      }),
    ]);

    res.status(200).json({ document: newVersion[1] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentVersions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });
    if (
      req.user.role !== "ADMIN" &&
      !(await checkDocumentAccess(req.user.id, req.params.id))
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const versions = await prisma.document.findMany({
      where: {
        OR: [
          { parentDocumentId: document.parentDocumentId || document.id },
          { id: document.parentDocumentId || document.id },
        ],
      },
      orderBy: { versionNumber: "asc" },
    });

    res.status(200).json({ versions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeDocument = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });
    if (
      req.user.role !== "ADMIN" &&
      !(await checkDocumentAccess(req.user.id, req.params.id))
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const analysis = await prisma.feedback.findMany({
      where: { documentId: req.params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
