import { Link, Navigate } from 'react-router';
import { AmbientBackdrop } from '@/components/ui/AmbientBackdrop';
import { BrandMark } from '@/components/ui/Icons';
import { vi } from '@/i18n/vi';
import type { AccountStore } from '@/sync/account';
import { accountStore } from '@/sync/useAccount';
import { AccountCard } from './AccountCard';

/** Standalone sign-in (/login) and sign-up (/register) pages, so an account does not require going through Profile. Signed in → the learning path. */
export function LoginPage({ store = accountStore(), mode = 'login' }: { store?: AccountStore; mode?: 'login' | 'register' }) {
  const t = vi.login;
  const head = mode === 'register' ? vi.register : t;
  const status = store((s) => s.status);
  if (status === 'signed_in') return <Navigate to="/learn" replace />;

  return (
    <div className="hero-backdrop relative flex min-h-dvh flex-col items-center bg-bg px-4 py-10 text-text">
      <AmbientBackdrop variant="marketing" />
      <main className="page-enter relative z-10 flex w-full max-w-md flex-col gap-5">
        <Link to="/welcome" className="group flex items-center justify-center gap-2.5 self-center rounded-2xl">
          <BrandMark className="size-11 transition-transform duration-(--motion-bounce) group-hover:-rotate-6 group-hover:scale-110" />
          <span className="text-2xl font-black tracking-tight text-brand-fg">{vi.appName}</span>
        </Link>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-3xl font-black tracking-tight">{head.title}</h1>
          <p className="text-text-muted">{head.subtitle}</p>
        </div>
        {status === 'disabled'
          ? <p role="status" className="rounded-2xl bg-surface px-4 py-3 text-center font-bold text-text-muted">{t.off}</p>
          : <AccountCard store={store} mode={mode} />}
        <Link to="/learn" className="self-center font-bold text-brand-fg underline underline-offset-2 hover:text-brand-500">{t.skip}</Link>
      </main>
    </div>
  );
}
