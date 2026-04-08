import { type PriorityTier } from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tierConfig: Record<PriorityTier, { bg: string; text: string; border: string; label: string }> = {
  URGENT:   { bg: 'bg-[#c0392b]/10', text: 'text-[#c0392b]', border: 'border-[#c0392b]/30', label: '● URGENT'   },
  HIGH:     { bg: 'bg-[#d68910]/10', text: 'text-[#d68910]', border: 'border-[#d68910]/30', label: '● HIGH'     },
  MODERATE: { bg: 'bg-[#1a5276]/20', text: 'text-[#2e86c1]', border: 'border-[#2e86c1]/30', label: '● MODERATE' },
  LOW:      { bg: 'bg-[#1e8449]/10', text: 'text-[#27ae60]', border: 'border-[#27ae60]/30', label: '● LOW'      },
};

export function TierBadge({ tier, className }: { tier: PriorityTier; className?: string }) {
  const config = tierConfig[tier];
  
  return (
    <span className={cn(
      config.bg,
      config.text,
      config.border,
      'border text-[10px] font-mono tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm inline-flex items-center gap-1.5 whitespace-nowrap',
      className
    )}>
      {config.label}
    </span>
  );
}
