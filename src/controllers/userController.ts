import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (req.user?.id !== userId && req.user?.role === "STUDENT") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (req.user?.id !== userId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { name, email } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (req.user?.id !== userId && req.user?.role === "STUDENT") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const documents = await prisma.document.findMany({
      where: {
        userId,
        isLatest: true,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
