'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
export function ThemeToggle(){const [dark,setDark]=useState(false);useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark]);return <button onClick={()=>setDark(!dark)} className="rounded-full border border-zinc-200 p-2 dark:border-zinc-800" aria-label="Alternar tema">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>}
