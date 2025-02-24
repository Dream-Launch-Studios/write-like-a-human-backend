import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";
import prisma from "../config/config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) throw new Error("Invalid token");

    // Get user from local database with role
    const localUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true },
    });

    if (!localUser) throw new Error("User not found");

    req.user = localUser;
    next();
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};
