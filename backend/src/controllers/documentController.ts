// src/controllers/documentController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";
import { Request as ExpressRequest } from "express";

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
  req: AuthenticatedRequest & Request & { file?: any },
  res: Response
) => {
  try {
    const { title, content } = req.body;
    const documentId = req.params.id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check permissions
    if (
      existingDocument.userId !== req.user.id &&
      req.user.role !== "TEACHER"
    ) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to update this document",
      });
    }

    const newVersion = await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
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
          fileSize: content
            ? Buffer.from(content).length
            : existingDocument.fileSize,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      document: newVersion[1],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
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

export const uploadDocument = async (
  req: AuthenticatedRequest & Request & { file?: any },
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Only allow students to upload
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        error: "Only students can upload documents",
      });
    }

    const { groupId, title } = req.body;
    const file = req.file;

    // Validate file
    if (
      !file.mimetype.match(
        /(text|application|image)\/(plain|pdf|doc|docx|msword|jpeg|png|jpg)/
      )
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid file type",
      });
    }

    // Check group access if groupId is provided
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId: req.user.id,
            },
          },
        },
      });

      if (!group) {
        return res.status(403).json({
          success: false,
          error: "You must be a member of this group to upload documents",
        });
      }
    }

    const newDocument = await prisma.document.create({
      data: {
        title: title || file.originalname,
        content: "",
        groupId: groupId || null,
        userId: req.user.id,
        versionNumber: 1,
        isLatest: true,
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    res.status(201).json({
      success: true,
      document: newDocument,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
