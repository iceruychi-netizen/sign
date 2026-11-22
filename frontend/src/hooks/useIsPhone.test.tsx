import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useIsPhone } from './useIsPhone';

const real = globalThis.matchMedia;
afterEach(() => { globalThis.matchMedia = real; });

describe('useIsPhone', () => {
  it('is false where matchMedia is missing', () => {
    // @ts-expect-error simulate an environment without matchMedia
    globalThis.matchMedia = undefined;
    expect(renderHook(() => useIsPhone()).result.current).toBe(false);
  });

  it('follows the phone-width media query', () => {
    globalThis.matchMedia = ((q: string) => ({ matches: q.includes('767px'), addEventListener() {}, removeEventListener() {} })) as unknown as typeof matchMedia;
    expect(renderHook(() => useIsPhone()).result.current).toBe(true);
  });
});
