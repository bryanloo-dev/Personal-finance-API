import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db/pool";
import { AppError } from "../middleware/error.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

type UserRow = {
    id: string;
    name: string;
    email: string;
    password_hash: string;
};

function createToken(user: Pick<UserRow, "id" | "email">) {
    
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new AppError(500, "JWT secret not configured");
    }

    return jwt.sign(
        { id: user.id, email: user.email },
        
        secret,
        {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as NonNullable< 
        jwt.SignOptions["expiresIn"],
        >,
    }
    );
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        
        const existing = await query<UserRow>(
            "SELECT id FROM users WHERE email = $1",
            [data.email.toLowerCase()]
        );

        if (existing .rowCount) {
            throw new AppError(400, "Email already registered");
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const result = await query<UserRow>(
            `INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, password_hash`,
            [data.name, data.email.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        if (!user) {
            throw new AppError(500, "Failed to create user");
        }

        res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email },
            token: createToken(user)
        });
    } catch (error) {
        
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);

        const result = await query<UserRow>(
            "SELECT id, name, email, password_hash FROM users WHERE email = $1",
            [data.email.toLowerCase()]
        );

        const user = result.rows[0];

        if ( !user || !(await bcrypt.compare(data.password, user.password_hash))) {
            
            throw new AppError(401, "Invalid email or password");
        }

        res.json({

            user: { id: user.id, name: user.name, email: user.email },
            token: createToken(user)
        });
    } catch (error) {
    
        next(error);
    }
}