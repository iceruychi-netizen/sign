import { afterEach, describe, expect, it, vi } from 'vitest';
import { TIMING, rememberPointer, useLearnTransition } from './learnTransitionStore';

const realMatchMedia = globalThis.matchMedia;
const setMotion = (reduce: boolean) => {
  globalThis.matchMedia = ((q: string) => ({ matches: reduce && q.includes('reduce') })) as unknown as typeof matchMedia;
};

afterEach(() => {
  globalThis.matchMedia = realMatchMedia;
  vi.useRealTimers();
  useLearnTransition.setState({ phase: 'idle' });
});

describe('"Vào học" transition', () => {
  it('goes straight to the learn page when the user prefers reduced motion', () => {
    setMotion(true);
    const swap = vi.fn();
    useLearnTransition.getState().play(swap);
    expect(swap).toHaveBeenCalledOnce();
    expect(useLearnTransition.getState().phase).toBe('idle');
  });

  it('spreads from the pressed point, swaps the page only once covered, then ends', () => {
    setMotion(false);
    vi.useFakeTimers();
    rememberPointer(120, 640);
    const swap = vi.fn();
    useLearnTransition.getState().play(swap);
    expect(useLearnTransition.getState()).toMatchObject({ phase: 'spread', origin: { x: 120, y: 640 } });
    vi.advanceTimersByTime(TIMING.cat);
    expect(useLearnTransition.getState().phase).toBe('cat');
    expect(swap).not.toHaveBeenCalled();
    vi.advanceTimersByTime(TIMING.swap - TIMING.cat);
    expect(swap).toHaveBeenCalledOnce();
    expect(useLearnTransition.getState().phase).toBe('open');
    vi.advanceTimersByTime(TIMING.done - TIMING.swap);
    expect(useLearnTransition.getState().phase).toBe('idle');
  });

  it('ignores a second press while playing', () => {
    setMotion(false);
    vi.useFakeTimers();
    const swap = vi.fn();
    useLearnTransition.getState().play(swap);
    useLearnTransition.getState().play(swap);
    vi.advanceTimersByTime(TIMING.done);
    expect(swap).toHaveBeenCalledOnce();
  });
});
