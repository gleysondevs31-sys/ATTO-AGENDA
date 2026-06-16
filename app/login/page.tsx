import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
import { SetupRequired } from '@/components/admin/setup-required';
import { isDatabaseConfigured } from '@/lib/db/env';
export default function LoginPage(){if(!isDatabaseConfigured()) return <SetupRequired/>; return <AuthLayout eyebrow="Login seguro" title="Entre para operar sua agenda comercial." description="Gerencie links, horários, visitas, consultores e personalização pública em uma plataforma SaaS limpa e profissional."><AuthForm mode="login"/></AuthLayout>}
