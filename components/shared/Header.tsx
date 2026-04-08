'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LiveClock } from './LiveClock';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`transition-colors duration-150 uppercase tracking-widest text-[11px] font-medium ${
        isActive ? 'text-white' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  return (
    <header className="bg-[#0d1b2a] border-b border-white/10 z-50 relative">
      {/* GOVPH topbar — tiny strip above main nav, like PhilSA */}
      <div className="bg-[#07111a] px-6 py-1 flex items-center gap-4 text-[11px] text-white/40 font-mono">
        <a href="https://www.gov.ph" className="hover:text-white/70 transition-colors uppercase tracking-widest text-[10px]">GOVPH</a>
        <span>|</span>
        <span className="uppercase tracking-widest text-[10px]">Republic of the Philippines</span>
        <span>|</span>
        <span className="uppercase tracking-widest text-[10px]">UP Diliman</span>
      </div>

      {/* Main nav row */}
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Logo block — mimics PhilSA seal + name stack */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1c3354] border border-[#c9a84c]/40
                          flex items-center justify-center text-[#c9a84c] text-xs font-bold leading-none tracking-tighter">
            PH
          </div>
          <div className="border-l border-white/20 pl-3">
            <div className="text-[9px] text-white/50 tracking-widest uppercase font-mono">
              Republic of the Philippines
            </div>
            <div className="text-white font-semibold text-sm tracking-wide font-serif">
              Alam Daan
            </div>
            <div className="text-[10px] text-[#2e86c1] tracking-wide font-serif italic drop-shadow-sm">
              Infrastructure Intelligence System
            </div>
          </div>
        </div>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/map">LGU Map</NavLink>
          <NavLink href="/methodology">Methodology</NavLink>
          <NavLink href="/api-docs">API</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>

        {/* Right: clock + live badge — like PhilSA's PST clock */}
        <div className="flex items-center gap-4 text-right">
          <div className="hidden md:block text-[11px] text-white/50 font-mono text-right">
            <div className="text-white/40 text-[9px] tracking-widest uppercase mb-0.5">
              Philippine Standard Time
            </div>
            <div className="text-white/80">
              <LiveClock />
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1c3354]/50 border border-white/10 px-3 py-1.5 rounded text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <span className="text-green-400 font-mono tracking-widest text-[10px] uppercase">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
