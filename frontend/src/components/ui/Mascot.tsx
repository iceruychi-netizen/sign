export type MascotPose = 'front' | 'wave' | 'wink' | 'shock' | 'laptop' | 'headset' | 'back';
type Motion = 'hop' | 'sway' | 'breathe' | 'none';

/** Lingo, the SignLingo cat mascot. Decorative only: hidden from screen readers. */
export function Mascot({ pose, motion = 'none', className = '' }: { pose: MascotPose; motion?: Motion; className?: string }) {
  return (
    <img
      src={`/mascot/${pose}.png`}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      className={`pointer-events-none h-auto select-none ${motion === 'none' ? '' : `mascot-${motion}`} ${className}`}
    />
  );
}

/** Two cat ears that sit on top of a kawaii window. */
export function CatEars({ className = '' }: { className?: string }) {
  const ear = (
    <svg viewBox="0 0 120 70" className="h-full w-auto">
      <path d="M8 70 C12 32 30 6 48 4 C62 3 78 34 92 70 Z" fill="var(--kw-cream)" stroke="var(--kw-line)" strokeWidth="6" strokeLinejoin="round" />
      <path d="M28 66 C32 40 41 24 48 22 C57 22 66 42 72 66 Z" fill="var(--kw-ear-inner)" />
    </svg>
  );
  return (
    <div aria-hidden="true" className={`pointer-events-none flex justify-between px-8 ${className}`}>
      {ear}
      <span className="-scale-x-100">{ear}</span>
    </div>
  );
}
