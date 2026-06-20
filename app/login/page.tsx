import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
export default function LoginPage(){return <AuthLayout eyebrow="Login seguro" title="Entre para operar sua agenda comercial." description="Gerencie links, horários, visitas, consultores e personalização pública em uma plataforma SaaS limpa e profissional."><AuthForm mode="login"/></AuthLayout>}
