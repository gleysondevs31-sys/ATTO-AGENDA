import { getBookingLinkBySlug, listAppointments, listAvailabilityExceptions, listAvailabilityRules } from '@/lib/storage';
export type SlotResult = { slots: string[]; dailyLimitReached: boolean; link: any };
function minutes(value: string) { const [h,m]=String(value).split(':').map(Number); return h*60+m; }
function time(value: number) { return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`; }
function overlaps(start: string, end: string, slotStart: number, slotEnd: number) { return minutes(start) < slotEnd && minutes(end) > slotStart; }
export async function getAvailableSlots(slug: string, date: string): Promise<SlotResult> {
  const link = await getBookingLinkBySlug(slug); if(!link) throw new Error('Link indisponível.');
  const day = new Date(`${date}T00:00:00.000Z`); if(Number.isNaN(day.getTime())) throw new Error('Data inválida.');
  const weekday = day.getUTCDay(); const duration=Number(link.durationMinutes ?? link.duration ?? 30);
  const appointments=(await listAppointments(link.companyId)).filter((a:any)=>a.bookingLinkId===link.id && a.date===date && a.status!=='cancelled');
  if(appointments.length >= Number(link.dailyLimit ?? 999)) return { slots: [], dailyLimitReached: true, link };
  const rules=await listAvailabilityRules(link.id); const exceptions=await listAvailabilityExceptions(link.id, date);
  const source=rules.length?rules.filter((r:any)=>Number(r.weekday)===weekday):(link.availableDays??[]).includes(weekday)?(link.availableSlots??[]).map((slot:string)=>({startTime:slot,endTime:time(minutes(slot)+duration)})):[];
  const generated=new Set<string>(); for(const r of source) for(let start=minutes(r.startTime); start+duration<=minutes(r.endTime); start+=duration) generated.add(time(start));
  for(const e of exceptions.filter((e:any)=>e.type==='extra')) for(let start=minutes(e.startTime); start+duration<=minutes(e.endTime); start+=duration) generated.add(time(start));
  const blocked=exceptions.filter((e:any)=>e.type==='blocked');
  return { slots:[...generated].sort().filter((slot)=>{const start=minutes(slot), end=start+duration; if(appointments.some((a:any)=>a.startTime===slot)) return false; if(blocked.some((b:any)=>overlaps(b.startTime,b.endTime,start,end))) return false; return true;}), dailyLimitReached:false, link };
}
