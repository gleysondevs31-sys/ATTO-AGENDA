import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
export default function ForgotPasswordPage(){return <AuthLayout eyebrow="Recuperação" title="Recupere o acesso sem expor dados da conta." description="Por segurança, a resposta é sempre neutra para evitar enumeração de e-mails cadastrados."><AuthForm mode="forgot"/></AuthLayout>}
