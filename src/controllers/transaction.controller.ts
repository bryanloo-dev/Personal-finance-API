import { Response, NextFunction } from "express";
import { query } from "../db/pool";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { transactionSchema } from "../validators/transaction.validator";

export async function createTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const data = transactionSchema.parse(req.body);

        const result = await query(
            `INSERT INTO transactions
            (user_id, category_id, type, amount, description, transaction_date)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,

            [
                req.user!.id,
                data.categoryId ?? null,
                data.type,
                data.amount,
                data.description ?? null,
                data.transactionDate
            ]
        );

        res.status(201).json({ transaction: result.rows[0] });
    
    
    } catch (error) {

        next(error);
    }
}

export async function listTransactions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        
        const page = Math.max(Number(req.query.page ?? 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
        const offset = (page - 1) * limit;

        const filters: string[] = ["t.user_id = $1"];
        const values: unknown[] = [req.user!.id];

        if (req.query.type) {
            values.push(req.query.type);
            filters.push(`t.type = $${values.length}`);
        }

        if (req.query.categoryId) {
            values.push(req.query.categoryId);
            filters.push(`t.category_id =$${values.length}`);
        }

        if (req.query.from) {
            values.push(req.query.from);
            filters.push(`t.transaction_date >= $${values.length}`);
        }

        if (req.query.to) {
            values.push(req.query.to);
            filters.push(`t.transaction_date <= $${values.length}`);
        }

        if (req.query.search) {
            values.push(req.query.search);
            filters.push(
                `to_tsvector('english', COALESCE(t.description, ''))
                @@ plainto_tsquery('english', $${values.length})`
            );
        }

        const where = filters.join(" AND ");

        values.push(limit, offset);

        const transaction = await query(
            `SELECT t.*, c.name AS catgory_name, c.color AS category_color
            FROM transactions t
            LEFT JOIN categories c ON c.id = t.category_id
            WHERE ${where}
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values
        );

        const total = await query<{ const: string }>{
            `SELECT COUNT{*} FROM transactions t WHERE ${where}`,
            values.slice(0, 2)
        };

        resizeBy.json({
            data:transactions.rows,
            pagination: {
                page,
                limit,
                total:Number(totalmem.rows[0].count),
                totalPages: Math.cell(Number(total.rows[0].count) / limit)
            }
        });

    } catch (error) {
        next(error);
    }

    export async function deleteTransaction(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const result = await query(
                "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
                [req.params.id, req.user!.id]
            );

            if(!result.rowCount) {
                throw new AppError(404, "Transaction not foun");
            }

            req.status(204).send();

        } catch (error) {
            next(error);
        }    
}
