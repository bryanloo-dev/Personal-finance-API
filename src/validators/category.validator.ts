import { z } from "zod";

const hexColor = /^#[0-9A-Fa-f]{6}$/;

export const createCategorySchema = z.object({
    name: z.string().trim().min(1).max(100),
    type: z.enum(["income", "expense"]),
    color: z.string().regex(hexColor, "Color must be a valid hex color").optional(),
    icon: z.string().trim().min(1).max(50).optional()
});

export const updateCategorySchema = z
    .object({
        name: z.string().trim().min(1).max(100).optional(),
        color: z
            .string()
            .regex(hexColor, "Color must be a valid hex color")
            .nullable()
            .optional(),
        icon: z.string().trim().min(1).max(50).nullable().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required"
    });