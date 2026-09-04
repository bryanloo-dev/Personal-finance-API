import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export function authenticate(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;

    if(!header?.startsWith("Bearer ")) {
        return next(new AppError(401, "Authentication required"));
    }

    try {
        const token = header.slice(7);

        const payload = jwt.verify(
            token, process.env.JWT_SECRET as string
        ) as { id: string; email: string };

        req.user = payload;
        next();
             
    } catch {
            next(new AppError(401, "Invalid or expired token"));
    }
}