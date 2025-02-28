import { Response } from "express";
import { AuthenticatedRequest } from "../types";
export declare const analyzeRawText: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const analyzeDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
