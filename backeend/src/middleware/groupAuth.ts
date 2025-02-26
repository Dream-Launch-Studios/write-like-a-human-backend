// src/middleware/groupAuth.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthenticatedUser } from "../types";
import prisma from "../config/config";

export const groupAdminAuth: RequestHandler = async (req, res, next) => {
  const user = req.user as AuthenticatedUser;
  const group = await prisma.group.findUnique({ where: { id: req.params.id } });

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }
  if (group.adminId !== user.id) {
    res.status(403).json({ error: "Not group admin" });
    return;
  }
  next();
};

export const checkGroupMembership: RequestHandler = async (req, res, next) => {
  const groupId = req.params.id;
  const user = req.user as AuthenticatedUser;
  const userId = user.id!;

  const isMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId,
    },
  });

  if (!isMember) {
    res.status(403).json({ error: "Not a group member" });
    return;
  }
  next();
};
