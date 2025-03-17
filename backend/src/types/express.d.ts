import { Request } from 'express';
import { Multer } from 'multer';
import { Buffer } from 'buffer';

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File & {
                buffer: Buffer;
            };
            files?: Array<Multer.File & {
                buffer: Buffer;
            }>;
        }
    }
}