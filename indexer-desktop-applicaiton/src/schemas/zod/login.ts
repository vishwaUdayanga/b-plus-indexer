import { z } from "zod";

export const LoginRequestSchema = z.object({
    username: z
        .string({ message: 'Email is required.' })
        .email({ message:  'Pleas enter a valid email.'}),
    password: z
        .string({ message: 'Password is required.' })
        .min(5, { message: 'Password must be at least 5 characters' })
        .max(100, { message: 'Password is too long.'}),
});