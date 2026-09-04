// Import libraries and types
import { Pool, QueryResultRow } from 'pg';
import "dotenv/config";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});

export const query = <T extends QueryResultRow>(
    text: string,
    params?: unknown[]
    ) => {
        return pool.query<T>(text, params);
    };  