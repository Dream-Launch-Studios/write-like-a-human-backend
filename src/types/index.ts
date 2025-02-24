import { Request } from "express";

export interface ApiError extends Error {
  statusCode: number;
}

export interface SubmissionAnalysis {
  aiScore: number;
  feedback: string;
  suggestions: string[];
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
  };
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}
