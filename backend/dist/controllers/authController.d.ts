import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<any>;
export declare const login: (req: Request, res: Response) => Promise<any>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<any>;
