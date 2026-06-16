import { Logo } from '@/components/logo';
import { AuthForm } from '@/components/admin/auth-forms';
export default function LoginPage(){return <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 dark:bg-zinc-950"><div className="w-full"><div className="mb-8 flex justify-center"><Logo/></div><AuthForm mode="login"/><p className="mt-5 text-center text-sm"><a href="/forgot-password">Esqueci minha senha</a> · <a href="/register">Criar empresa</a></p></div></main>}
