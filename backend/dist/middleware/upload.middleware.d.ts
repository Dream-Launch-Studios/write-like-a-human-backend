import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
export declare const uploadMiddleware: multer.Multer;
export declare const validatePdfMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
