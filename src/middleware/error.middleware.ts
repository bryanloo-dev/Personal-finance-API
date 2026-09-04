import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,

    ) {
        super (message);
        this.name = "AppError";
    }
}

export function notFound(
    req: Request,
    res: Response,
    next: NextFunction
) {
    next(new AppError(404, `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
){
    const statusCode =
        error instanceof AppError ? error.statusCode : 500;
    
    res.status(statusCode).json({
        error: {
            message:
                statusCode === 500
                    ? "Internal server error" 
                    : error.message,
        },
    });
}