import { create } from 'zustand';

export type TransitionPhase = 'idle' | 'spread' | 'cat' | 'open';

/** Milliseconds from the press: rings cover the screen, the cat pops in, the page swaps underneath, the cover opens. */
export const TIMING = { cat: 850, swap: 1700, done: 2600 } as const;

type State = {
  phase: TransitionPhase;
  origin: { x: number; y: number };
  /** Plays the "Vào học" animation and calls `swap` once the screen is fully covered. */
  play: (swap: () => void) => void;
};

let lastPointer: { x: number; y: number } | null = null;
let timers: ReturnType<typeof setTimeout>[] = [];

/** Remembers where the user last pressed so the rings spread from the button they clicked. */
export function rememberPointer(x: number, y: number) {
  lastPointer = { x, y };
}

/** No animation without a real browser (tests) or when the user asked for reduced motion. */
export function shouldAnimate(): boolean {
  const mm = globalThis.matchMedia;
  if (typeof mm !== 'function') return false;
  return !mm('(prefers-reduced-motion: reduce)').matches;
}

export const useLearnTransition = create<State>((set, get) => ({
  phase: 'idle',
  origin: { x: 0, y: 0 },
  play: (swap) => {
    if (get().phase !== 'idle' || !shouldAnimate()) {
      if (get().phase === 'idle') swap();
      return;
    }
    const origin = lastPointer ?? { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
    timers.forEach(clearTimeout);
    timers = [
      setTimeout(() => set({ phase: 'cat' }), TIMING.cat),
      setTimeout(() => { swap(); set({ phase: 'open' }); }, TIMING.swap),
      setTimeout(() => set({ phase: 'idle' }), TIMING.done),
    ];
    set({ phase: 'spread', origin });
  },
}));
