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
) => {
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

// export const checkGroupMembership = async (
//   userId: string,
//   groupId: string
// ): Promise<boolean> => {
//   const count = await prisma.groupMember.count({
//     where: {
//       userId,
//       groupId,
//       group: {
//         OR: [{ adminId: userId }, { members: { some: { userId } } }],
//       },
//     },
//   });
//   return count > 0;
// };
