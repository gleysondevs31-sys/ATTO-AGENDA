import { z } from 'zod';

const slot = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');
const day = z.number().int().min(0).max(6);

export const createBookingLinkSchema = z.object({
  userId: z.string().min(1).optional(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  title: z.string().max(120).optional(),
  instructions: z.string().max(600).optional(),
  importantNotes: z.string().max(600).optional(),
  whatsappUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  consultantPhotoUrl: z.string().max(500).optional(),
  bannerUrl: z.string().max(500).optional(),
  logoUrl: z.string().max(500).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  theme: z.enum(['light','dark','auto']).optional(),
  layout: z.enum(['side','centered','banner']).optional(),
  welcomeText: z.string().max(600).optional(),
  confirmationText: z.string().max(600).optional(),
  imageUrl: z.string().url().optional(),
  address: z.string().min(5).max(240),
  duration: z.number().int().min(10).max(240),
  dailyLimit: z.number().int().min(1).max(500),
  minScheduleNoticeMinutes: z.number().int().min(0).max(43200).optional(),
  maxScheduleDays: z.number().int().min(1).max(365).optional(),
  allowPublicCancellation: z.boolean().optional(),
  allowPublicReschedule: z.boolean().optional(),
  minCancelRescheduleMinutes: z.number().int().min(0).max(43200).optional(),
  availableDays: z.array(day).min(1),
  availableSlots: z.array(slot).min(1),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const updateBookingLinkSchema = createBookingLinkSchema.partial();
