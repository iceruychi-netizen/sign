import type { DecorKind } from './candyLayout';

const W = 'var(--candy-white)';
const color = (n: number) => `var(--c${n})`;

/** One decorative sweet beside the road. Purely visual: hidden from assistive technology. */
export function CandyDecor({ kind, c1, c2, width, height }: { kind: DecorKind; c1: number; c2: number; width: number; height: number }) {
  const a = color(c1);
  const b = color(c2);
  const svg = { width, height, 'aria-hidden': true as const, focusable: false as const };
  switch (kind) {
    case 'lolly':
      return (
        <svg viewBox="0 0 60 120" {...svg}>
          <rect x="27" y="52" width="6" height="66" rx="3" fill={W} />
          <circle cx="30" cy="30" r="27" fill={a} stroke={W} strokeWidth="3" />
          <path d="M30 30 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16" fill="none" stroke={b} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="20" cy="17" rx="7" ry="4" fill={W} opacity="0.7" />
        </svg>
      );
    case 'cane':
      return (
        <svg viewBox="0 0 44 110" {...svg}>
          <path d="M30 106 V32 a12 12 0 0 0 -24 0" fill="none" stroke={W} strokeWidth="11" strokeLinecap="round" />
          <path d="M30 106 V32 a12 12 0 0 0 -24 0" fill="none" stroke={a} strokeWidth="11" strokeDasharray="7 7" />
        </svg>
      );
    case 'donut':
      return (
        <svg viewBox="0 0 64 64" {...svg}>
          <circle cx="32" cy="34" r="19" fill="none" stroke="var(--candy-dough)" strokeWidth="24" />
          <circle cx="32" cy="31" r="18" fill="none" stroke={a} strokeWidth="18" />
          <g strokeWidth="3" strokeLinecap="round">
            <path d="M18 20l4 2" stroke={W} /><path d="M42 16l3 3" stroke="var(--candy-sprinkle-1)" />
            <path d="M48 32l1 4" stroke="var(--candy-sprinkle-2)" /><path d="M16 38l3-3" stroke="var(--candy-sprinkle-1)" />
            <path d="M34 46l4 1" stroke={W} /><path d="M26 12l4-1" stroke="var(--candy-sprinkle-2)" />
          </g>
        </svg>
      );
    case 'cupcake':
      return (
        <svg viewBox="0 0 64 76" {...svg}>
          <path d="M12 40 L52 40 L46 74 L18 74 Z" fill={b} stroke={W} strokeWidth="2.5" />
          <path d="M22 41 L24 73 M32 41 V73 M42 41 L40 73" stroke={W} strokeWidth="2" opacity="0.7" />
          <path d="M8 42 C2 30 14 22 20 24 C20 12 34 8 40 16 C48 10 62 20 56 30 C64 34 60 44 52 42 Z" fill={a} stroke={W} strokeWidth="2.5" />
          <circle cx="34" cy="10" r="6" fill="var(--candy-cherry)" stroke={W} strokeWidth="2" />
        </svg>
      );
    case 'icecream':
      return (
        <svg viewBox="0 0 56 100" {...svg}>
          <path d="M12 46 L44 46 L28 98 Z" fill="var(--candy-cone)" stroke={W} strokeWidth="2.5" />
          <path d="M16 56 L38 76 M40 56 L20 80 M22 46 L36 88" stroke="var(--candy-cone-line)" strokeWidth="1.6" />
          <circle cx="28" cy="38" r="17" fill={b} stroke={W} strokeWidth="2.5" />
          <circle cx="28" cy="18" r="14" fill={a} stroke={W} strokeWidth="2.5" />
          <ellipse cx="22" cy="13" rx="5" ry="3" fill={W} opacity="0.7" />
        </svg>
      );
    case 'house':
      return (
        <svg viewBox="0 0 90 90" {...svg}>
          <rect x="16" y="40" width="58" height="46" rx="6" fill="var(--candy-cookie)" stroke={W} strokeWidth="3" />
          <path d="M6 44 L45 8 L84 44 Z" fill={a} stroke={W} strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 44 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0 q5 6 10 0 q4 6 8 0" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round" />
          <rect x="38" y="58" width="16" height="28" rx="8" fill={b} />
          <rect x="22" y="54" width="12" height="12" rx="3" fill={W} />
          <rect x="58" y="54" width="12" height="12" rx="3" fill={W} />
          <circle cx="45" cy="30" r="6" fill={W} />
        </svg>
      );
    case 'tree':
      return (
        <svg viewBox="0 0 80 110" {...svg}>
          <rect x="35" y="58" width="10" height="50" rx="5" fill={W} />
          <path d="M35 66 L45 74 M35 82 L45 90 M35 98 L45 106" stroke={b} strokeWidth="3" />
          <g fill={a} stroke={W} strokeWidth="3"><circle cx="40" cy="30" r="24" /><circle cx="20" cy="46" r="17" /><circle cx="60" cy="46" r="17" /></g>
          <ellipse cx="32" cy="20" rx="8" ry="5" fill={W} opacity="0.6" />
        </svg>
      );
    case 'gum':
      return (
        <svg viewBox="0 0 60 50" {...svg}>
          <path d="M6 46 C6 14 18 4 30 4 C42 4 54 14 54 46 Z" fill={a} stroke={W} strokeWidth="3" />
          <ellipse cx="22" cy="18" rx="6" ry="4" fill={W} opacity="0.65" />
          <circle cx="34" cy="30" r="2" fill={W} /><circle cx="22" cy="34" r="2" fill={W} /><circle cx="42" cy="38" r="2" fill={W} />
        </svg>
      );
  }
}

export function Cloud({ width }: { width: number }) {
  return (
    <svg viewBox="0 0 120 60" width={width} height={width / 2} aria-hidden="true" focusable="false">
      <g fill={W}><ellipse cx="38" cy="38" rx="30" ry="18" /><ellipse cx="64" cy="28" rx="28" ry="22" /><ellipse cx="88" cy="40" rx="26" ry="16" /></g>
    </svg>
  );
}

export function Sparkle({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M12 1 14.4 9.6 23 12l-8.6 2.4L12 23l-2.4-8.6L1 12l8.6-2.4z" fill={W} />
    </svg>
  );
}
