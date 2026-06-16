'use client';
import { useState, type ElementType, type FormEvent } from 'react';
import { ArrowRight, Building2, LockKeyhole, Mail, User } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const endpoint = mode === 'login' ? '/api/auth/login' : mode === 'register' ? '/api/auth/register' : '/api/auth/forgot-password';
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const json = await response.json();
    if (!response.ok) { setLoading(false); return setMessage(json.error ?? 'Não foi possível continuar. Verifique os dados e tente novamente.'); }
    if (mode === 'forgot') { setLoading(false); return setMessage(json.data.message); }
    window.location.href = '/dashboard';
  }
  const title = mode === 'login' ? 'Entrar na ATTO AGENDA' : mode === 'register' ? 'Criar empresa e usuário owner' : 'Recuperar acesso';
  const subtitle = mode === 'login' ? 'Acesse sua agenda, links públicos e painel comercial.' : mode === 'register' ? 'Cadastre a empresa e o primeiro usuário com acesso total.' : 'Informe seu e-mail para receber instruções, se a conta existir.';
  return <form onSubmit={submit} className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
    <h1 className="text-3xl font-black tracking-tight">{title}</h1>
    <p className="mt-2 text-sm leading-6 text-zinc-500">{subtitle}</p>
    {mode === 'register' && <Input icon={Building2} name="companyName" label="Nome da empresa" placeholder="Metrocasa Construtora" required/>}
    {mode === 'register' && <Input icon={User} name="name" label="Seu nome" placeholder="Connor Alves" required/>}
    <Input icon={Mail} name="email" label="E-mail" type="email" placeholder="voce@empresa.com.br" required/>
    {mode !== 'forgot' && <Input icon={LockKeyhole} name="password" label="Senha" type="password" placeholder="Mínimo 8 caracteres" required/>}
    {message && <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">{message}</p>}
    <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-atto-red px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>{loading ? 'Processando...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar instruções'} <ArrowRight size={18}/></button>
    <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-zinc-500">
      {mode !== 'login' && <a className="font-semibold text-zinc-900 dark:text-white" href="/login">Já tenho conta</a>}
      {mode !== 'register' && <a className="font-semibold text-zinc-900 dark:text-white" href="/register">Criar empresa</a>}
      {mode !== 'forgot' && <a className="font-semibold text-zinc-900 dark:text-white" href="/forgot-password">Esqueci minha senha</a>}
    </div>
  </form>;
}
function Input({ name, label, icon: Icon, type='text', placeholder, required }: { name: string; label: string; icon: ElementType; type?: string; placeholder?: string; required?: boolean }) { return <label className="mt-4 block"><span className="text-sm font-semibold">{label}</span><div className="mt-2 flex items-center gap-3 rounded-xl border border-zinc-200 bg-transparent px-3 focus-within:border-atto-red dark:border-zinc-800"><Icon className="text-zinc-400" size={18}/><input name={name} type={type} required={required} placeholder={placeholder} className="w-full bg-transparent py-3 outline-none"/></div></label>; }
