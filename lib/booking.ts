import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { cleanOptional, cleanText } from '@/lib/security/sanitize';
import type { z } from 'zod';
import type { createBookingLinkSchema, updateBookingLinkSchema } from '@/lib/validation/booking-link';

type CreateBookingLinkInput = z.infer<typeof createBookingLinkSchema>;
type UpdateBookingLinkInput = z.infer<typeof updateBookingLinkSchema>;

export function toCreateBookingData(input: CreateBookingLinkInput, companyId: string): Prisma.BookingLinkUncheckedCreateInput {
  return {
    companyId,
    userId: input.userId,
    slug: cleanText(input.slug.toLowerCase(), 80),
    name: cleanText(input.name, 120),
    description: cleanOptional(input.description, 500),
    imageUrl: input.imageUrl,
    address: cleanText(input.address, 240),
    duration: input.duration,
    dailyLimit: input.dailyLimit,
    availableDays: input.availableDays,
    availableSlots: input.availableSlots,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    isActive: input.isActive ?? true,
  };
}

export function toUpdateBookingData(input: UpdateBookingLinkInput): Prisma.BookingLinkUncheckedUpdateInput {
  return {
    ...(input.userId !== undefined ? { userId: input.userId } : {}),
    ...(input.slug !== undefined ? { slug: cleanText(input.slug.toLowerCase(), 80) } : {}),
    ...(input.name !== undefined ? { name: cleanText(input.name, 120) } : {}),
    ...(input.description !== undefined ? { description: cleanOptional(input.description, 500) } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    ...(input.address !== undefined ? { address: cleanText(input.address, 240) } : {}),
    ...(input.duration !== undefined ? { duration: input.duration } : {}),
    ...(input.dailyLimit !== undefined ? { dailyLimit: input.dailyLimit } : {}),
    ...(input.availableDays !== undefined ? { availableDays: input.availableDays } : {}),
    ...(input.availableSlots !== undefined ? { availableSlots: input.availableSlots } : {}),
    ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };
}

export async function writeAudit(companyId: string, action: string, entity: string, entityId: string, metadata?: Prisma.InputJsonValue) {
  await prisma.auditLog.create({ data: { companyId, action, entity, entityId, metadata } });
}

export async function getPublicBookingLink(slug: string) {
  const now = new Date();
  const link = await prisma.bookingLink.findUnique({
    where: { slug },
    include: { company: true, user: true, appointments: { where: { status: { not: 'cancelled' }, startsAt: { gte: now } }, select: { startsAt: true } } },
  });
  if (!link || !link.isActive || (link.expiresAt && link.expiresAt < now)) return null;
  return link;
}

export function publicLinkDto(link: NonNullable<Awaited<ReturnType<typeof getPublicBookingLink>>>) {
  const reservedSlots = link.appointments.map((appointment) => appointment.startsAt.toISOString());
  return {
    id: link.id,
    slug: link.slug,
    name: link.name,
    description: link.description,
    imageUrl: link.imageUrl,
    address: link.address,
    duration: link.duration,
    dailyLimit: link.dailyLimit,
    availableDays: link.availableDays,
    availableSlots: link.availableSlots,
    company: { name: link.company.name, slug: link.company.slug },
    consultant: link.user ? { name: link.user.name, title: link.user.title, avatarUrl: link.user.avatarUrl } : null,
    reservedSlots,
  };
}
