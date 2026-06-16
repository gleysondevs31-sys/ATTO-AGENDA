import { AuthForm } from '@/components/admin/auth-forms';
import { AuthLayout } from '@/components/admin/auth-layout';
export default function RegisterPage(){return <AuthLayout eyebrow="Cadastro inicial" title="Crie sua empresa e comece a receber visitas." description="O cadastro cria a Company, o primeiro usuário owner e as configurações visuais padrão para publicar o primeiro link."><AuthForm mode="register"/></AuthLayout>}
