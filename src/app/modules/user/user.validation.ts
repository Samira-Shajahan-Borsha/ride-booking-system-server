import z from "zod";
import { IS_ACTIVE, ROLE } from "./user.interface";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createUserZodSchema = z.object({
    name: z
        .string()
        .min(2, { error: "Name must be at least 2 characters long." })
        .max(50, { error: "Name cannot exceed 50 characters." }),
    email: z.email({ pattern: emailRegex }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[@$!%*?&^#()[\]{}\-_=+|;:'",.<>/~`]/, "Password must contain at least one special character"),
    role: z.enum(Object.values(ROLE)),
});

export const updateUserZodSchema = z
    .object({
        name: z
            .string()
            .min(2, { error: "Name must be at least 2 characters long." })
            .max(50, { error: "Name cannot exceed 50 characters." })
            .optional(),
        phone: z
            .string({ error: "Phone Number must be string" })
            .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
                message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
            })
            .optional(),
        role: z.enum(Object.values(ROLE)).optional(),
        isActive: z.enum(Object.values(IS_ACTIVE)).optional(),
        isDeleted: z.boolean().optional(),
    })
    .strict();
