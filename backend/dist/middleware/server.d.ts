import { Request, Response, NextFunction } from "express";
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
export declare const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<any>;
