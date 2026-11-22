import { useEffect, type CSSProperties } from 'react';
import { Mascot } from '@/components/ui/Mascot';
import { vi } from '@/i18n/vi';
import { rememberPointer, useLearnTransition } from './learnTransitionStore';

const RINGS = [1, 2, 3, 4, 5] as const;
const CHIPS = ['A', 'B', 'C', '5', 'J', 'Z', 'L', 'O', 'V', '8'] as const;
const CHIP_INK = ['var(--brand-fg)', 'var(--success-fg)', 'var(--warning-fg)', 'var(--candy-sync-link)', 'var(--candy-w3-ribbon)'] as const;
const PAWS = Array.from({ length: 14 }, (_, i) => i);

function Paw({ style }: { style: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" width="30" height="30" className="lt-paw" style={style}>
      <g fill="var(--surface)">
        <ellipse cx="20" cy="26" rx="10" ry="8" />
        <circle cx="9" cy="14" r="4.5" /><circle cx="17" cy="9" r="4.5" /><circle cx="25" cy="9" r="4.5" /><circle cx="32" cy="14" r="4.5" />
      </g>
    </svg>
  );
}

/** Full-screen "Vào học" animation: candy rings spread from the pressed button, Lingo the cat pops in, then the learn page opens from the centre. */
export function LearnTransition() {
  const phase = useLearnTransition((s) => s.phase);
  const { x, y } = useLearnTransition((s) => s.origin);

  useEffect(() => {
    const onDown = (e: PointerEvent) => rememberPointer(e.clientX, e.clientY);
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, []);

  if (phase === 'idle') return null;
  const covering = phase === 'spread' || phase === 'cat';

  return (
    <div className="pointer-events-auto fixed inset-0 z-[100] overflow-hidden">
      {covering ? (
        <div aria-hidden="true">
          {RINGS.map((n) => (
            <div key={n} className="lt-ring" style={{ left: x, top: y, background: `var(--lt-ring-${n})`, animationDelay: `${(n - 1) * 0.12}s` }} />
          ))}
          {CHIPS.map((c, i) => {
            const a = (i / CHIPS.length) * Math.PI * 2;
            const d = 260 + (i % 3) * 45;
            const style = { left: x, top: y, color: CHIP_INK[i % 5], animationDelay: `${0.25 + i * 0.04}s`, '--dx': `${Math.round(Math.cos(a) * d)}px`, '--dy': `${Math.round(Math.sin(a) * d)}px` } as CSSProperties;
            return <span key={c} className="lt-chip" style={style}>{c}</span>;
          })}
          {PAWS.map((i) => {
            const a = (i / PAWS.length) * Math.PI * 2 + 0.3;
            const d = `min(${38 + (i % 2) * 8}vmin, 420px)`;
            return <Paw key={i} style={{ left: `calc(50% + ${Math.cos(a).toFixed(3)} * ${d})`, top: `calc(50% + ${Math.sin(a).toFixed(3)} * ${d})`, animationDelay: `${0.45 + i * 0.05}s` }} />;
          })}
        </div>
      ) : (
        <div aria-hidden="true" className="lt-cover lt-open absolute inset-0" />
      )}
      {phase !== 'spread' && (
        <div role="status" className={`absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 ${phase === 'open' ? 'lt-fade' : ''}`}>
          <span className="lt-pop rounded-full border-4 border-(--lt-bubble-line) bg-surface px-6 py-1.5 text-2xl font-black text-(--lt-bubble-ink) shadow-[0_5px_0_var(--lt-bubble-lip)] sm:text-3xl">
            {vi.learnTransition.go}
          </span>
          <Mascot pose="wave" className="lt-pop w-36 sm:w-48 [animation-delay:80ms]" />
        </div>
      )}
    </div>
  );
}
