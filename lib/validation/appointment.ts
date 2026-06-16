import { z } from 'zod';

export const appointmentStatuses = ['scheduled','confirmed','rescheduled','cancelled','attended','no_show','converted'] as const;

export const createAppointmentSchema = z.object({
  bookingLinkId: z.string().min(1).optional(),
  slug: z.string().min(3).optional(),
  startsAt: z.string().datetime(),
  client: z.object({
    fullName: z.string().min(3).max(160),
    phone: z.string().min(8).max(30),
    email: z.string().email().optional(),
    cpf: z.string().min(11).max(14).optional(),
  }),
  notes: z.string().max(600).optional(),
}).refine((data) => data.bookingLinkId || data.slug, 'Informe bookingLinkId ou slug.');

export const updateAppointmentSchema = z.object({
  startsAt: z.string().datetime().optional(),
  status: z.enum(appointmentStatuses).optional(),
  notes: z.string().max(600).optional(),
});
