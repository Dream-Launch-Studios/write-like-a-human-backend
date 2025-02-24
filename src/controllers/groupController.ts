import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const createGroup = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "TEACHER" && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Only teachers can create groups" });
    }

    const { name, description } = req.body;
    const joinToken = uuidv4();

    const group = await prisma.group.create({
      data: {
        name,
        description,
        joinToken,
        adminId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add other group controller methods following similar patterns
// (getGroups, getGroup, updateGroup, deleteGroup, manageMembers, etc.)

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const group = await prisma.group.findUnique({
      where: { joinToken: token },
    });

    if (!group) {
      return res.status(404).json({ error: "Invalid or expired join token" });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user?.id!,
          groupId: group.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "Already a member" });
    }

    await prisma.groupMember.create({
      data: {
        userId: req.user?.id!,
        groupId: group.id,
      },
    });

    res.status(200).json({
      message: "Successfully joined group",
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
