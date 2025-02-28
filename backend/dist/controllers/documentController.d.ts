import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types";
export declare const checkDocumentAccess: (userId: string, documentId: string) => Promise<boolean>;
export declare const listDocuments: (req: AuthenticatedRequest, res: Response) => Promise<any>;
export declare const createDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDocument: (req: AuthenticatedRequest & Request & {
    file?: any;
}, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDocumentVersions: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const analyzeDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadDocument: (req: AuthenticatedRequest & Request & {
    file?: any;
}, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
