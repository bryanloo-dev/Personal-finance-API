import { z } from 'zod';

export const transactionSchema = z.object({
    categoryId: z.string().uuid().nullable().optional(),
    type: z.enum(['income', 'expense']),
    amount: z.number().positive(),
    description: z.string().max(500).optional(),
    transactionDate: z.string().date()
});