import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
import { SetupRequired } from '@/components/admin/setup-required';
import { isDatabaseConfigured } from '@/lib/db/env';
export default function RegisterPage(){if(!isDatabaseConfigured()) return <SetupRequired/>; return <AuthLayout eyebrow="Cadastro inicial" title="Crie sua empresa e comece a receber visitas." description="O cadastro cria a Company, o primeiro usuário owner e as configurações visuais padrão para publicar o primeiro link."><AuthForm mode="register"/></AuthLayout>}
