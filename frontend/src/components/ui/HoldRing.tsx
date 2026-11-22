import type { ReactNode } from 'react';

const R = 52;
const C = 2 * Math.PI * R;

/** Circular hold progress around a letter: luminous rose-pink while holding, emerald when full. */
export function HoldRing({ progress, label, children }: { progress: number; label: string; children?: ReactNode }) {
  const p = Math.max(0, Math.min(1, progress));
  const full = p >= 1;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
      data-full={full}
      className="relative inline-flex size-32 items-center justify-center rounded-full bg-surface shadow-(--card-shadow)"
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-surface-2" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
          className={`transition-[stroke-dashoffset,stroke] duration-(--motion-fast) ${full ? 'stroke-success-fg' : 'stroke-brand-500'}`}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
