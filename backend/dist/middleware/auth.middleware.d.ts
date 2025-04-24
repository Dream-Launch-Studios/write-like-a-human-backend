import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const roleMiddleware: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const teacherMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const studentMiddleware: (req: Request, res: Response, next: NextFunction) => void;
