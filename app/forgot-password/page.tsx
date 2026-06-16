import { Logo } from '@/components/logo';
import { AuthForm } from '@/components/admin/auth-forms';
export default function ForgotPasswordPage(){return <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 dark:bg-zinc-950"><div className="w-full"><div className="mb-8 flex justify-center"><Logo/></div><AuthForm mode="forgot"/><p className="mt-5 text-center text-sm"><a href="/login">Voltar ao login</a></p></div></main>}
