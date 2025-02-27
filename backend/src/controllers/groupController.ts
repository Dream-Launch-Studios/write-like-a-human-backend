// src/controllers/groupController.ts
import { Request, Response } from "express";
import {
  PrismaClient,
  UserRole,
  Group,
  GroupMember,
  Document,
} from "@prisma/client";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/config";

// Type extensions
interface GroupWithMembers extends Group {
  admin: {
    id: string;
    name: string | null;
    email: string;
  };
  members: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: UserRole;
    };
  }>;
}

// Helper functions
const generateUniqueToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const checkGroupMembership = async (
  userId: string,
  groupId: string
): Promise<boolean> => {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      OR: [{ adminId: userId }, { members: { some: { userId } } }],
    },
  });
  return !!group;
};

// Controllers
export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    if (req.user?.role !== "TEACHER" && req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Only teachers can create groups" });
    }

    const { name, description } = req.body;
    const joinToken = generateUniqueToken();

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

export const listGroups = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    let groups: Group[];

    if (req.user.role === "ADMIN") {
      groups = await prisma.group.findMany({
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
            },
          },
        },
      });
    } else {
      groups = await prisma.group.findMany({
        where: {
          OR: [
            { adminId: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              documents: true,
            },
          },
        },
      });
    }

    res.status(200).json({ groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const groupId = req.params.id;
    const isMember = await checkGroupMembership(req.user.id, groupId);

    if (!isMember && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const group = (await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    })) as GroupWithMembers | null;

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ group });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const groupId = req.params.id;
    const { name, description } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to update group" });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { name, description },
    });

    res.status(200).json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const groupId = req.params.id;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to delete group" });
    }

    await prisma.group.delete({
      where: { id: groupId },
    });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listGroupMembers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const groupId = req.params.id;
    const isMember = await checkGroupMembership(req.user.id, groupId);

    if (!isMember && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({ members });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addGroupMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.adminId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to add members" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "User already in group" });
    }

    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeGroupMember = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id: groupId, userId } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check permissions
    const isAdmin = req.user.role === "ADMIN";
    const isSelf = req.user.id === userId;
    const isGroupAdmin = group.adminId === req.user.id;

    if (!isAdmin && !isSelf && !isGroupAdmin) {
      return res.status(403).json({ error: "Unauthorized to remove member" });
    }

    // Prevent removing group admin
    if (userId === group.adminId) {
      return res.status(400).json({ error: "Cannot remove group admin" });
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupDocuments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const groupId = req.params.id;
    const isMember = await checkGroupMembership(req.user.id, groupId);

    if (!isMember && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const documents = await prisma.document.findMany({
      where: {
        groupId,
        isLatest: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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

export const joinGroupWithToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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
          userId: req.user.id,
          groupId: group.id,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: "Already a member of this group" });
    }

    await prisma.groupMember.create({
      data: {
        userId: req.user.id,
        groupId: group.id,
      },
    });

    res.status(200).json({
      message: "Successfully joined the group",
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
