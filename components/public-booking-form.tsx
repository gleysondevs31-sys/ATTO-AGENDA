'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, QrCode } from 'lucide-react';

type PublicLink = {
  id: string;
  slug: string;
  duration: number;
  availableDays: number[];
  availableSlots: string[];
  reservedSlots: string[];
};

function isoFor(day: number, slot: string) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + day);
  const [hours, minutes] = slot.split(':').map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function PublicBookingForm({ link }: { link: PublicLink }) {
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(link.availableSlots[0] ?? '09:00');
  const [result, setResult] = useState<{ protocol: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const days = useMemo(() => Array.from({ length: 21 }, (_, index) => index).filter((offset) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    return link.availableDays.includes(date.getUTCDay());
  }).slice(0, 14), [link.availableDays]);
  const selectedIso = isoFor(day, slot);
  const reserved = new Set(link.reservedSlots.map((value) => value.slice(0, 16)));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setResult(null);
    const response = await fetch('/api/public/appointments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug: link.slug,
        startsAt: selectedIso,
        client: {
          fullName: formData.get('fullName'),
          phone: formData.get('phone'),
          email: formData.get('email') || undefined,
          cpf: formData.get('cpf') || undefined,
        },
        notes: formData.get('notes') || undefined,
      }),
    });
    const json = await response.json();
    if (!response.ok) return setError(json.error ?? 'Não foi possível agendar.');
    setResult({ protocol: json.data.protocol });
  }

  return <form onSubmit={submit} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
    <h2 className="text-2xl font-black">Escolha o melhor horário</h2>
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
      <div><p className="mb-3 font-bold">1. Data</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{days.map((offset) => { const date = new Date(); date.setUTCDate(date.getUTCDate() + offset); return <button type="button" key={offset} onClick={() => setDay(offset)} className={`rounded-xl border p-3 text-left ${day === offset ? 'border-atto-red bg-atto-red text-white' : 'border-zinc-200 dark:border-zinc-800'}`}><span className="block text-sm opacity-70">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</span><strong>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</strong></button>; })}</div></div>
      <div><p className="mb-3 font-bold">2. Horário</p><div className="grid grid-cols-2 gap-2">{link.availableSlots.map((value) => { const disabled = reserved.has(isoFor(day, value).slice(0, 16)); return <button type="button" disabled={disabled} key={value} onClick={() => setSlot(value)} className={`rounded-xl border px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${slot === value ? 'border-atto-red bg-atto-red text-white' : 'border-zinc-200 dark:border-zinc-800'}`}>{value}</button>; })}</div></div>
    </div>
    <h2 className="mt-8 text-2xl font-black">Seus dados</h2>
    <div className="mt-5 grid gap-4 md:grid-cols-2"><Input name="fullName" label="Nome completo" placeholder="Maria Silva" required/><Input name="phone" label="Telefone" placeholder="(11) 99999-9999" required/><Input name="email" label="E-mail (opcional)" placeholder="maria@email.com"/><Input name="cpf" label="CPF (opcional)" placeholder="000.000.000-00"/><label className="md:col-span-2"><span className="text-sm font-semibold">Observações</span><textarea name="notes" className="mt-2 min-h-24 w-full rounded-xl border border-zinc-200 bg-transparent p-3 outline-none focus:border-atto-red dark:border-zinc-800" placeholder="Conte alguma preferência para o atendimento"/></label></div>
    {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {result && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">✅ Visita confirmada. Protocolo: <strong>{result.protocol}</strong></div>}
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 md:flex-row md:items-center md:justify-between"><div><p className="font-bold">Resumo</p><p className="text-sm text-zinc-500">{new Date(selectedIso).toLocaleDateString('pt-BR')} às {slot} · {link.duration} min</p></div><div className="flex gap-2"><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 font-bold dark:border-zinc-800"><QrCode size={18}/> QR Code</button><button className="inline-flex items-center gap-2 rounded-xl bg-atto-red px-5 py-3 font-bold text-white"><CheckCircle2 size={18}/> Confirmar</button></div></div>
  </form>;
}

function Input({ name, label, placeholder, required }: { name: string; label: string; placeholder: string; required?: boolean }) {
  return <label><span className="text-sm font-semibold">{label}</span><input name={name} required={required} className="mt-2 w-full rounded-xl border border-zinc-200 bg-transparent p-3 outline-none focus:border-atto-red dark:border-zinc-800" placeholder={placeholder}/></label>;
}
