export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3" aria-label="ATTO AGENDA"><div className="relative h-9 w-9 rounded-xl bg-atto-red"><div className="absolute left-2 top-2 h-5 w-5 rotate-45 border-l-[10px] border-t-[10px] border-white" /></div>{!compact && <div><p className="text-sm font-black tracking-[0.24em]">ATTO</p><p className="-mt-1 text-xs font-semibold tracking-[0.34em] text-zinc-500">AGENDA</p></div>}</div>;
}
