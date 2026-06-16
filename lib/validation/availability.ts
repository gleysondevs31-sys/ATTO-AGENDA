import { z } from 'zod';
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const availabilityRuleSchema = z.object({ userId: z.string().optional(), weekday: z.number().int().min(0).max(6), startTime: time, endTime: time, isActive: z.boolean().optional() });
export const availabilityExceptionSchema = z.object({ userId: z.string().optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: time, endTime: time, type: z.enum(['blocked','extra']), reason: z.string().max(240).optional() });
export const saveAvailabilitySchema = z.object({ duration: z.number().int().min(10).max(240).optional(), lunchStart: time.optional(), lunchEnd: time.optional(), rules: z.array(availabilityRuleSchema).min(1), exceptions: z.array(availabilityExceptionSchema).optional() });
