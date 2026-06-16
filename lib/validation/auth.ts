import { z } from 'zod';

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const registerSchema = z.object({ companyName: z.string().min(2).max(120), name: z.string().min(2).max(120), email: z.string().email(), password: z.string().min(8).max(120) });
export const forgotPasswordSchema = z.object({ email: z.string().email() });
