import { useEffect, useState } from 'react';

const QUERY = '(max-width: 767px)';
const matches = () => typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(QUERY).matches;

/** True on phone-width screens (below Tailwind's md breakpoint). Always false where matchMedia is missing (tests). */
export function useIsPhone(): boolean {
  const [phone, setPhone] = useState(matches);
  useEffect(() => {
    if (typeof globalThis.matchMedia !== 'function') return;
    const mq = globalThis.matchMedia(QUERY);
    const on = () => setPhone(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return phone;
}
