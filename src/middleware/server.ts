import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/config";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

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

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    console.log("🔍 Verifying JWT token...");
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    console.log("✅ Token Decoded:", decoded);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.log("❌ Authentication Error:", error.message);
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};
