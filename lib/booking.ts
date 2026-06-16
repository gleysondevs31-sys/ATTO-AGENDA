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
    title: cleanOptional(input.title, 120),
    instructions: cleanOptional(input.instructions, 600),
    importantNotes: cleanOptional(input.importantNotes, 600),
    whatsappUrl: input.whatsappUrl,
    instagramUrl: input.instagramUrl,
    websiteUrl: input.websiteUrl,
    consultantPhotoUrl: input.consultantPhotoUrl,
    bannerUrl: input.bannerUrl,
    logoUrl: input.logoUrl,
    primaryColor: input.primaryColor,
    secondaryColor: input.secondaryColor,
    buttonColor: input.buttonColor,
    backgroundColor: input.backgroundColor,
    textColor: input.textColor,
    theme: input.theme,
    layout: input.layout,
    welcomeText: cleanOptional(input.welcomeText, 600),
    confirmationText: cleanOptional(input.confirmationText, 600),
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
    ...(input.title !== undefined ? { title: cleanOptional(input.title, 120) } : {}),
    ...(input.instructions !== undefined ? { instructions: cleanOptional(input.instructions, 600) } : {}),
    ...(input.importantNotes !== undefined ? { importantNotes: cleanOptional(input.importantNotes, 600) } : {}),
    ...(input.whatsappUrl !== undefined ? { whatsappUrl: input.whatsappUrl } : {}),
    ...(input.instagramUrl !== undefined ? { instagramUrl: input.instagramUrl } : {}),
    ...(input.websiteUrl !== undefined ? { websiteUrl: input.websiteUrl } : {}),
    ...(input.consultantPhotoUrl !== undefined ? { consultantPhotoUrl: input.consultantPhotoUrl } : {}),
    ...(input.bannerUrl !== undefined ? { bannerUrl: input.bannerUrl } : {}),
    ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
    ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor } : {}),
    ...(input.secondaryColor !== undefined ? { secondaryColor: input.secondaryColor } : {}),
    ...(input.buttonColor !== undefined ? { buttonColor: input.buttonColor } : {}),
    ...(input.backgroundColor !== undefined ? { backgroundColor: input.backgroundColor } : {}),
    ...(input.textColor !== undefined ? { textColor: input.textColor } : {}),
    ...(input.theme !== undefined ? { theme: input.theme } : {}),
    ...(input.layout !== undefined ? { layout: input.layout } : {}),
    ...(input.welcomeText !== undefined ? { welcomeText: cleanOptional(input.welcomeText, 600) } : {}),
    ...(input.confirmationText !== undefined ? { confirmationText: cleanOptional(input.confirmationText, 600) } : {}),
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
    company: { name: link.company.name, slug: link.company.slug, logoUrl: link.company.logoUrl, bannerUrl: link.company.bannerUrl, primaryColor: link.company.primaryColor, secondaryColor: link.company.secondaryColor, buttonColor: link.company.buttonColor, backgroundColor: link.company.backgroundColor, textColor: link.company.textColor, theme: link.company.theme },
    consultant: link.user ? { name: link.user.name, title: link.user.title, avatarUrl: link.user.avatarUrl } : null,
    appearance: { title: link.title, consultantPhotoUrl: link.consultantPhotoUrl, bannerUrl: link.bannerUrl ?? link.company.bannerUrl, logoUrl: link.logoUrl ?? link.company.logoUrl, primaryColor: link.primaryColor ?? link.company.primaryColor ?? '#ed1c24', secondaryColor: link.secondaryColor ?? link.company.secondaryColor ?? '#129247', buttonColor: link.buttonColor ?? link.company.buttonColor ?? '#ed1c24', backgroundColor: link.backgroundColor ?? link.company.backgroundColor ?? '#ffffff', textColor: link.textColor ?? link.company.textColor ?? '#09090b', theme: link.theme ?? link.company.theme ?? 'auto', layout: link.layout ?? 'side', welcomeText: link.welcomeText, confirmationText: link.confirmationText, instructions: link.instructions, importantNotes: link.importantNotes, whatsappUrl: link.whatsappUrl, instagramUrl: link.instagramUrl, websiteUrl: link.websiteUrl },
    reservedSlots,
  };
}
