import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
import { SetupRequired } from '@/components/admin/setup-required';
import { isDatabaseConfigured } from '@/lib/db/env';
export default function ForgotPasswordPage(){if(!isDatabaseConfigured()) return <SetupRequired/>; return <AuthLayout eyebrow="Recuperação" title="Recupere o acesso sem expor dados da conta." description="Por segurança, a resposta é sempre neutra para evitar enumeração de e-mails cadastrados."><AuthForm mode="forgot"/></AuthLayout>}
