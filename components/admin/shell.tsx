import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><aside className="fixed hidden h-full w-64 border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:block"><Logo/><nav className="mt-8 grid gap-2 text-sm"><a href="/dashboard">Dashboard</a><a href="/booking-links">Links</a><a href="/appointments">Agendamentos</a><a href="/users">Usuários</a><a href="/settings/appearance">Aparência</a><a href="/profile">Perfil</a></nav></aside><section className="lg:pl-64"><header className="border-b border-zinc-200 bg-white px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900"><h1 className="text-2xl font-black">{title}</h1></header><div className="p-5">{children}</div></section></main>;
}
