// src/types/index.ts
import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export type ExpressHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void | Response | undefined>;

export type CustomRequestHandler = (
  req: Request<ParamsDictionary>,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;
