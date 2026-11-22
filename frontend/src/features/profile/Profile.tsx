import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { loadActiveManifest } from '@/app/staticData';
import { AccountCard } from '@/features/account/AccountCard';
import { JoinCard } from '@/features/leaderboard/JoinCard';
import { Card } from '@/components/ui/Card';
import { BoltIcon, FlameIcon, SettingsIcon, StarIcon } from '@/components/ui/Icons';
import { dateKey } from '@/game/streak';
import { vi } from '@/i18n/vi';
import { useLearner } from '@/storage/useLearner';
import { buildHeatmap, type HeatDay } from './heatmap';

const LEVEL_CLASS: Record<HeatDay['level'], string> = {
  0: 'bg-surface-2', 1: 'bg-brand-200', 2: 'bg-brand-300', 3: 'bg-brand-500', 4: 'bg-brand-600',
};

const STAT_ICONS = [
  { Icon: BoltIcon, bg: 'bg-warning-bg/70 text-xp' },
  { Icon: FlameIcon, bg: 'bg-warning-bg/70 text-streak' },
  { Icon: StarIcon, bg: 'bg-brand-100 text-brand-fg' },
] as const;

/** Profile: XP, streaks, 12-week activity and per-letter mastery, all from the learner's own data. */
export function Profile({ labels: given, now = () => new Date() }: { labels?: string[]; now?: () => Date }) {
  const profile = useLearner((s) => s.profile);
  const stats = useLearner((s) => s.stats);
  const daily = useLearner((s) => s.daily);
  const signStats = useLearner((s) => s.signStats);
  const goal = useLearner((s) => s.settings.daily_xp_goal);
  const [fetched, setFetched] = useState<string[]>([]);
  const labels = given ?? fetched;
  const t = vi.profile;

  useEffect(() => {
    if (given) return;
    let live = true;
    loadActiveManifest('static_letters').then((m) => live && setFetched(m.labels)).catch(() => {});
    return () => { live = false; };
  }, [given]);

  const grid = useMemo(() => buildHeatmap(daily, dateKey(now(), profile.timezone), goal), [daily, profile.timezone, goal, now]);
  const activeDays = grid.flat().filter((d) => d.xp > 0).length;
  const name = profile.display_name;
  const tried = labels.filter((l) => (signStats[l]?.attempts ?? 0) > 0);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-5">
      <h1 className="sr-only">{t.title}</h1>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div role="img" aria-label={t.avatar} className="unit-banner flex size-20 items-center justify-center rounded-full text-4xl font-black text-ink-on-pink">
            {(name?.[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-text">{name ?? t.anonymous}</p>
          </div>
        </div>
        <Link
          to="/settings"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-border bg-surface px-4 py-2 text-sm font-extrabold text-brand-fg shadow-[0_2px_0_var(--border)] transition-colors hover:border-brand-300 hover:bg-brand-50"
        >
          <SettingsIcon className="size-4" />
          {vi.nav.settings}
        </Link>
      </Card>

      <dl className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {([[t.xp, String(stats.total_xp)], [t.streak, t.days(stats.current_streak)], [t.longest, t.days(stats.longest_streak)]] as const).map(([k, v], idx) => {
          const { Icon, bg } = STAT_ICONS[idx];
          return (
            <Card key={k} className="flex flex-col items-center gap-1.5 p-2.5 text-center sm:p-4">
              <span aria-hidden="true" className={`inline-flex size-9 items-center justify-center rounded-xl ${bg}`}>
                <Icon className="size-5" />
              </span>
              <dt className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-text-muted sm:text-xs sm:tracking-wider">{k}</dt>
              <dd className="text-lg font-black tabular-nums leading-tight text-brand-fg sm:text-2xl">{v}</dd>
            </Card>
          );
        })}
      </dl>

      <AccountCard />
      <JoinCard />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-text">{t.heatmap}</h2>
          <div aria-hidden="true" className="flex items-center gap-1 text-[11px] font-extrabold text-text-muted">
            <span>Ít</span>
            {([0, 1, 2, 3, 4] as const).map((lvl) => (
              <span key={lvl} className={`size-3 rounded-sm ${LEVEL_CLASS[lvl]}`} />
            ))}
            <span>Nhiều</span>
          </div>
        </div>
        <div role="img" aria-label={t.heatmapLabel} className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {grid.map((week) => (
            <div key={week[0].date} className="flex flex-col gap-1.5">
              {week.map((d) => (
                <div
                  key={d.date} title={t.day(d.date, d.xp)} data-level={d.level}
                  className={`size-4 rounded-md ${d.future ? 'opacity-20' : ''} ${LEVEL_CLASS[d.level]}`}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-bold text-text-muted">{t.activeDays(activeDays)}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-black text-text">{t.mastery}</h2>
        {tried.length === 0 ? <p className="mt-2 text-text-muted">{t.masteryEmpty}</p> : (
          <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {labels.map((l) => {
              const s = signStats[l];
              const pct = s && s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null;
              return (
                <li
                  key={l} aria-label={pct === null ? `${l}: ${t.notTried}` : t.masteryItem(l, pct, s.attempts)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 ${
                    pct !== null && pct >= 80 ? 'border-brand-300 bg-brand-50' : 'border-border bg-surface'
                  }`}
                >
                  <span className="text-xl font-black text-text" aria-hidden="true">{l}</span>
                  <span className="text-xs font-extrabold tabular-nums text-text-muted" aria-hidden="true">{pct === null ? '—' : `${pct}%`}</span>
                  <span aria-hidden="true" className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    {pct !== null && <span className="progress-fill block h-full rounded-full" style={{ width: `${pct}%` }} />}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
