import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'ATTO AGENDA | Plataforma SaaS de agendamentos', description: 'Links inteligentes para visitas comerciais, reuniões e CRM multiempresa.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body className="min-h-screen font-sans antialiased">{children}</body></html>; }
