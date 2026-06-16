import { z } from 'zod';

const slot = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');
const day = z.number().int().min(0).max(6);

export const createBookingLinkSchema = z.object({
  userId: z.string().min(1).optional(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  address: z.string().min(5).max(240),
  duration: z.number().int().min(10).max(240),
  dailyLimit: z.number().int().min(1).max(500),
  availableDays: z.array(day).min(1),
  availableSlots: z.array(slot).min(1),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const updateBookingLinkSchema = createBookingLinkSchema.partial();
