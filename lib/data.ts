import { CalendarCheck, CheckCircle2, Clock3, XCircle } from 'lucide-react';

export const metrics = [
  { label: 'Total de agendamentos', value: '2.847', delta: '+18,4%', icon: CalendarCheck },
  { label: 'Confirmados', value: '1.964', delta: '+12,1%', icon: CheckCircle2 },
  { label: 'Pendentes', value: '624', delta: '-4,2%', icon: Clock3 },
  { label: 'Cancelados', value: '259', delta: '-7,8%', icon: XCircle },
];

export const appointments = [
  { time: '09:00', client: 'Marina Lopes', status: 'Confirmado', origin: 'WhatsApp', consultant: 'Connor Alves' },
  { time: '10:30', client: 'Rafael Nunes', status: 'Pendente', origin: 'Instagram', consultant: 'Ana Prado' },
  { time: '14:00', client: 'Bianca Souza', status: 'Confirmado', origin: 'E-mail', consultant: 'Connor Alves' },
  { time: '16:30', client: 'João Martins', status: 'Reagendado', origin: 'SMS', consultant: 'Lívia Reis' },
];

export const slots = ['09:00', '09:30', '10:00', '10:30', '13:30', '14:00', '15:00', '16:30'];
export const webhookEvents = ['appointment.created', 'appointment.confirmed', 'appointment.cancelled', 'appointment.rescheduled'];
