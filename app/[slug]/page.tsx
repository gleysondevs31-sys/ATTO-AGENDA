import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Share2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicBookingForm } from '@/components/public-booking-form';
import { getPublicBookingLink, publicLinkDto } from '@/lib/booking';

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const record = await getPublicBookingLink(params.slug).catch(() => null);
  if (!record) notFound();
  const link = publicLinkDto(record);
  const consultantName = link.consultant?.name ?? link.company.name;
  return <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Logo/><ThemeToggle/></header><section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[380px_1fr]"><aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900"><div className="h-28 rounded-2xl bg-atto-red p-5 text-white"><Logo compact/><p className="mt-4 text-sm font-semibold">{link.company.name}</p></div><div className="-mt-8 ml-5 grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-zinc-950 text-2xl font-black text-white dark:border-zinc-900">{consultantName.slice(0,2).toUpperCase()}</div><h1 className="mt-5 text-3xl font-black">{consultantName}</h1><p className="text-zinc-500">{link.consultant?.title ?? 'Consultor comercial'} · {link.company.name}</p><p className="mt-4 flex gap-2 text-sm"><MapPin className="shrink-0 text-atto-red" size={18}/>{link.address}</p><p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{link.description ?? 'Escolha uma data e horário disponível para confirmar sua visita. Você receberá um protocolo automático.'}</p><div className="mt-5 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800"><p className="text-xs uppercase tracking-widest text-zinc-500">Link público</p><p className="mt-1 font-mono text-sm">agenda.sistema.com/{link.slug}</p></div></aside><div className="space-y-6"><div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-center gap-2"><CalendarDays className="text-atto-red"/><h2 className="text-2xl font-black">Agendamento público</h2></div><p className="mt-2 text-zinc-600 dark:text-zinc-300">Mostramos somente dias e horários configurados no link, ocultando horários já reservados.</p></div><PublicBookingForm link={link}/><div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="flex items-center gap-2 font-black"><Share2 className="text-atto-green"/> Reagendamento sem atendente</h2><p className="mt-2 text-zinc-600 dark:text-zinc-300">Após agendar, o protocolo pode ser usado pela equipe para confirmar presença, reagendar ou cancelar a visita.</p></div></div></section></main>;
}
