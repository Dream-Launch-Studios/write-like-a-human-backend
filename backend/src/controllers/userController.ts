import { Request, Response } from "express";
import prisma from "../config/config";

export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    const userId = req.params.id;
    const user = req.user;

    console.log("🛠 Debug: req.user.id Type:", typeof user.id);
    console.log("🛠 Debug: userId Type:", typeof userId);
    console.log("🛠 Debug: req.user.id Value:", user.id);
    console.log("🛠 Debug: userId Value:", userId);

    if (user.id !== userId && user.role === "STUDENT") {
      if (String(user.id) !== String(userId) && user.role === "STUDENT") {
        console.log(
          `❌ Unauthorized: User ${user.id} tried to access ${userId}`
        );
        return res.status(403).json({ error: "Unauthorized access" });
      }

      return res.status(403).json({ error: "Unauthorized access" });
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: userData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
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

export const getUserDocuments = async (
  req: Request,
  res: Response
): Promise<any> => {
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
