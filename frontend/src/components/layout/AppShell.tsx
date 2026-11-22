import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { vi } from '@/i18n/vi';
import { CatEars, Mascot } from '@/components/ui/Mascot';
import { AlphabetIcon, BrandMark, HandIcon, HomeIcon, LabIcon, TrophyIcon, UserIcon } from '@/components/ui/Icons';
import { StatChip } from '@/components/ui/StatChip';

type NavItem = {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/learn', label: vi.nav.learn, Icon: HomeIcon },
  { to: '/practice', label: vi.nav.practice, Icon: HandIcon },
  { to: '/alphabet', label: vi.nav.alphabet, Icon: AlphabetIcon },
  { to: '/leaderboard', label: vi.nav.leaderboard, Icon: TrophyIcon },
  { to: '/lab', label: vi.nav.lab, Icon: LabIcon },
  { to: '/profile', label: vi.nav.profile, Icon: UserIcon },
];

type Stats = { streak: number; xp: number; hearts: number };

function SidebarNav() {
  return (
    <ul className="flex flex-col gap-1.5">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `group flex min-h-12 items-center gap-3.5 rounded-2xl border-2 px-3.5 py-2 text-sm font-extrabold tracking-wide transition-[background-color,border-color,color,transform] duration-(--motion-fast) ${
                isActive
                  ? 'border-(--kw-line) bg-brand-50 text-brand-fg shadow-[0_3px_0_var(--kw-line)]'
                  : 'border-dashed border-transparent text-(--kw-ink) hover:border-(--kw-dash) hover:bg-surface hover:text-brand-fg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-(--motion-fast) ${
                    isActive ? 'btn-pink text-ink-on-pink shadow-none' : 'bg-surface-2 text-text-muted group-hover:bg-brand-100 group-hover:text-brand-fg'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Floating pill bottom dock on mobile, inspired by the rounded active-pink dock in the reference UI. */
function BottomNav() {
  return (
    <ul className="flex items-center justify-around gap-1">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <li key={to} className="min-w-0 flex-1">
          <NavLink
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full px-0.5 py-1 text-[11px] font-extrabold transition-colors duration-(--motion-fast) ${
                isActive ? 'text-brand-fg' : 'text-(--kw-ink) hover:text-brand-fg'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition-[background-color,transform] duration-(--motion-fast) ${
                    isActive ? 'btn-pink text-ink-on-pink shadow-none' : 'bg-transparent'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="max-w-full truncate">{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Kawaii shell: pastel sky, cream sidebar window with cat ears and Lingo the cat, cream content window, candy dock on mobile. */
export function AppShell({ stats, banner, account }: { stats: Stats; banner?: ReactNode; account?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="kw-sky relative min-h-dvh text-(--kw-ink) md:grid md:grid-cols-[17rem_1fr] md:gap-4 md:p-4">
      <div aria-hidden="true" className="kw-clouds pointer-events-none fixed inset-0 z-0" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:border-2 focus:border-brand-300 focus:bg-surface focus:px-4 focus:py-2.5 focus:font-extrabold focus:text-brand-fg"
      >
        {vi.nav.skip}
      </a>
      <div className="sticky top-4 z-20 hidden h-[calc(100dvh-2rem)] flex-col md:flex">
        <CatEars className="-mb-1 h-9" />
        <nav aria-label={vi.nav.sidebar} className="kw-window flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem]">
          <Link to="/" className="kw-titlebar group flex items-center gap-3 px-4 py-3">
            <BrandMark className="size-9 transition-transform duration-(--motion-bounce) group-hover:-rotate-6 group-hover:scale-110" />
            <span className="kw-title text-xl font-black tracking-tight">{vi.appName}</span>
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav />
          </div>
          <div className="relative flex flex-col items-center border-t-2 border-dashed border-(--kw-line) px-3 pb-3 pt-2">
            <Mascot pose="wave" motion="sway" className="w-28" />
            <Link
              to="/welcome"
              className="flex min-h-10 items-center justify-center rounded-full px-3 text-xs font-extrabold text-(--kw-ink) transition-colors hover:bg-brand-50 hover:text-brand-fg"
            >
              ← Trang giới thiệu
            </Link>
          </div>
        </nav>
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col pb-28 md:min-h-0 md:pb-0">
        <CatEars className="mx-4 -mb-1 h-8 md:hidden" />
        <div className="kw-window mx-2 flex flex-1 flex-col rounded-[1.75rem] md:mx-0">
          <header className="kw-titlebar sticky top-0 z-20 flex items-center justify-between gap-2 rounded-t-[1.6rem] px-4 py-2.5 md:px-6">
            <Link to="/" className="flex items-center gap-2 md:hidden">
              <BrandMark className="size-8" />
              <span className={`kw-title text-lg font-black tracking-tight ${account ? 'hidden sm:inline' : ''}`}>{vi.appName}</span>
            </Link>
            <Mascot pose="laptop" motion="breathe" className="hidden w-14 md:block" />
            <div className="flex items-center gap-2">
              {account}
              <StatChip kind="streak" value={stats.streak} />
              <StatChip kind="xp" value={stats.xp} />
              <StatChip kind="hearts" value={stats.hearts} />
            </div>
          </header>
          {banner}
          <main id="main" className="flex-1 p-4 md:p-8">
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </main>
        </div>
        <div aria-hidden="true" className="kw-scallop mx-8 hidden md:block" />
      </div>
      <nav
        aria-label={vi.nav.bottom}
        className="kw-window fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md rounded-[1.5rem] px-2 py-1.5 md:hidden"
      >
        <BottomNav />
      </nav>
    </div>
  );
}
