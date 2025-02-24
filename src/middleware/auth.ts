import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { ApiError } from "../types";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    (req as any).user = user;
    next();
  } catch (error) {
    const apiError: ApiError = new Error("Unauthorized");
    apiError.statusCode = 401;
    next(apiError);
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      const apiError: ApiError = new Error("Forbidden");
      apiError.statusCode = 403;
      return next(apiError);
    }

    next();
  };
};
