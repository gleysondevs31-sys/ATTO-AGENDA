'use client';
import { useState, type FormEvent } from 'react';

export function AuthForm({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const endpoint = mode === 'login' ? '/api/auth/login' : mode === 'register' ? '/api/auth/register' : '/api/auth/forgot-password';
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = await response.json();
    if (!response.ok) { setLoading(false); return setMessage(json.error ?? 'Não foi possível continuar.'); }
    if (mode === 'forgot') { setLoading(false); return setMessage(json.data.message); }
    window.location.href = '/dashboard';
  }
  return <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
    <h1 className="text-3xl font-black">{mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Recuperar senha'}</h1>
    <p className="mt-2 text-sm text-zinc-500">ATTO AGENDA · Plataforma de agendamentos comerciais</p>
    {mode === 'register' && <Input name="companyName" label="Empresa" required/>}
    {mode !== 'forgot' && <Input name="name" label="Nome" hidden={mode === 'login'} required={mode === 'register'}/>}<Input name="email" label="E-mail" type="email" required/>{mode !== 'forgot' && <Input name="password" label="Senha" type="password" required/>}
    {message && <p className="mt-4 rounded-xl border border-zinc-200 p-3 text-sm text-zinc-600 dark:border-zinc-800">{message}</p>}
    <button className="mt-6 w-full rounded-xl bg-atto-red px-5 py-3 font-bold text-white" disabled={loading}>{loading ? 'Carregando...' : 'Continuar'}</button>
  </form>;
}
function Input({ name, label, type='text', required, hidden }: { name: string; label: string; type?: string; required?: boolean; hidden?: boolean }) { if (hidden) return null; return <label className="mt-4 block"><span className="text-sm font-semibold">{label}</span><input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-zinc-200 bg-transparent p-3 outline-none focus:border-atto-red dark:border-zinc-800"/></label>; }
