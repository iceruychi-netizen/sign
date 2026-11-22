import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { loadActiveManifest } from '@/app/staticData';
import { BoltIcon, LockIcon, PlayIcon, ShieldLockIcon, StarIcon, TrophyIcon } from '@/components/ui/Icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import curriculumJson from '@/content/curriculum.json';
import { loadCurriculum } from '@/content/loader';
import type { Curriculum, Lesson } from '@/content/types';
import { dateKey } from '@/game/streak';
import { lessonStatus } from '@/game/unlock';
import { vi } from '@/i18n/vi';
import { useLearner } from '@/storage/useLearner';
import { CandyDecor, Cloud, Sparkle } from './CandyDecor';
import { DECOR_SIZE, layoutMap, roadPath } from './candyLayout';
import { SkillNode } from './SkillNode';

export type LearnData = { curriculum: Curriculum; model: { model_id: string; version: string } };

export async function loadLearnData(): Promise<LearnData> {
  const manifest = await loadActiveManifest('static_letters');
  return { curriculum: loadCurriculum(curriculumJson, manifest.labels), model: { model_id: manifest.model_id, version: manifest.version } };
}

/** Approximate lane width in px per 1 % of x, used to keep a lesson's details card inside the lane. */
const LANE_PX_PER_PCT = 6.6;
const MAX_CHIPS = 6;

/** The signs a lesson practises, in order, from its items (no content is invented here). */
function lessonGlosses(lesson: Lesson, glossOf: Map<string, string>): string[] {
  const out: string[] = [];
  for (const item of [...lesson.items].sort((a, b) => a.order - b.order)) {
    const g = item.sign_code ? glossOf.get(item.sign_code) : undefined;
    if (g && !out.includes(g)) out.push(g);
  }
  return out;
}

/** Learning path as a candy map: a winding road through three unit worlds, lessons as glossy sweets. */
export function SkillTree({ load = loadLearnData, now = () => new Date() }: { load?: () => Promise<LearnData>; now?: () => Date }) {
  const progress = useLearner((s) => s.progress);
  const daily = useLearner((s) => s.daily);
  const goal = useLearner((s) => s.settings.daily_xp_goal);
  const tz = useLearner((s) => s.profile.timezone);
  const [data, setData] = useState<LearnData | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const t = vi.learn;

  useEffect(() => {
    let live = true;
    load().then((d) => live && setData(d)).catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [load]);

  const today = daily[dateKey(now(), tz)]?.xp_earned ?? 0;
  const units = useMemo(
    () => [...(data?.curriculum.units ?? [])].sort((a, b) => a.order - b.order).map((u) => ({ ...u, lessons: [...u.lessons].sort((a, b) => a.order - b.order) })),
    [data],
  );
  const glossOf = useMemo(() => new Map((data?.curriculum.signs ?? []).map((s): [string, string] => [s.code, s.gloss])), [data]);
  const map = useMemo(() => layoutMap(units.map((u) => u.lessons.length)), [units]);

  const flat = units.flatMap((u) => u.lessons);
  const statuses = flat.map((l) => lessonStatus(l, progress));
  const firstOpen = statuses.findIndex((s) => s === 'available' || s === 'in_progress');
  const lastDone = statuses.reduce((acc, s, i) => (s === 'completed' ? i : acc), -1);
  const doneUntil = Math.max(lastDone, firstOpen);
  const road = roadPath(map.points);
  const roadDone = doneUntil > 0 ? roadPath(map.points.slice(0, doneUntil + 1)) : '';

  let g = 0;
  return (
    <section className="candy-sky relative -m-4 min-h-full overflow-hidden pb-10 md:-m-6">
      <h1 className="sr-only">{t.title}</h1>

      {/* sky */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[6%] top-6 size-28">
        <div className="candy-rays candy-rays-spin absolute -inset-14 rounded-full" />
        <div className="candy-sun absolute inset-5 rounded-full" />
      </div>
      <div aria-hidden="true" className="candy-drift pointer-events-none absolute left-[4%] top-10"><Cloud width={170} /></div>
      <div aria-hidden="true" className="candy-drift pointer-events-none absolute left-[42%] top-24 opacity-90 [animation-delay:-3s]"><Cloud width={120} /></div>

      {/* HUD: goal, sync, legend */}
      <div className="relative z-10 flex max-w-5xl flex-wrap gap-4 px-6 pt-4 [zoom:0.62] md:[zoom:0.7]">
        <div className="candy-goal-card flex flex-[1_1_16rem] flex-col gap-2.5 rounded-[1.75rem] border-4 border-surface px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{t.goal}</h2>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface text-xp"><BoltIcon className="size-5" /></span>
          </div>
          <ProgressBar value={today} max={goal} label={t.goal} className="border-surface" />
          <p className="text-base font-black">{t.goalValue(today, goal)}</p>
        </div>
        <div className="candy-sync-card flex flex-[1_1_16rem] flex-col gap-2 rounded-[1.75rem] border-4 border-surface px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="candy-sync-badge inline-flex size-10 items-center justify-center rounded-2xl text-text-on-brand"><ShieldLockIcon className="size-5" /></span>
            <h2 className="text-lg font-black">{t.sync}</h2>
          </div>
          <p className="text-[13px] leading-relaxed">{t.syncText}</p>
          <Link to="/profile" className="candy-sync-link text-sm font-black underline underline-offset-4">{t.syncLink}</Link>
        </div>
        <div className="candy-legend-card flex flex-[1_1_12rem] flex-col gap-2 rounded-[1.75rem] border-4 border-surface px-5 py-4 text-[13px]">
          <h2 className="text-lg font-black">{t.legend}</h2>
          <p className="flex items-center gap-2.5"><span aria-hidden="true" className="candy-node candy-node-available size-6 rounded-full border-2" />{t.legendItems.available}</p>
          <p className="flex items-center gap-2.5"><span aria-hidden="true" className="candy-node candy-node-completed size-6 rounded-full border-2" />{t.legendItems.completed}</p>
          <p className="flex items-center gap-2.5"><span aria-hidden="true" className="candy-node candy-node-locked size-6 rounded-full border-2" />{t.legendItems.locked}</p>
        </div>
      </div>

      {failed && <p role="alert" className="relative z-10 mx-6 mt-6 rounded-2xl bg-danger-bg p-4 font-bold text-danger-on-bg">{t.loadError}</p>}
      {!data && !failed && <p className="relative z-10 mx-6 mt-6 font-bold text-text">{t.loading}</p>}

      {data && (
        <div className="relative mt-2 [zoom:0.6] md:[zoom:0.66]" style={{ height: map.height }}>
          {/* unit worlds, full width */}
          {units.map((unit, ui) => {
            const box = map.units[ui];
            return (
              <div key={unit.code} aria-hidden="true" className={`candy-world-${(ui % 3) + 1} candy-zone absolute inset-x-0 overflow-hidden`} style={{ top: box.zoneTop, height: box.zoneHeight }}>
                <div className="absolute -inset-x-[20%] -top-16 h-36 rounded-[50%] bg-[var(--w-back)] opacity-50" />
                <div className="absolute -bottom-20 -left-[12%] h-52 w-[72%] rounded-[50%] bg-[var(--w-h1)] opacity-60" />
                <div className="absolute -bottom-24 -right-[14%] h-56 w-[78%] rounded-[50%] bg-[var(--w-h2)] opacity-65" />
                <div className="candy-zone-dots absolute inset-0 opacity-60" />
                <span className="candy-flag absolute left-5 top-14 rounded-2xl border-[3px] border-surface bg-surface/90 px-3.5 py-1.5 text-base font-black">{t.worlds[ui % 3]}</span>
                {box.decor.map((d, i) => (
                  <div key={i} className={`absolute z-[1] ${d.float ? 'float-slow' : ''}`} style={{ left: `${d.left}%`, top: d.top, animationDelay: `-${d.delay.toFixed(1)}s` }}>
                    <CandyDecor kind={d.kind} c1={d.c1} c2={d.c2} width={DECOR_SIZE[d.kind][0]} height={DECOR_SIZE[d.kind][1]} />
                  </div>
                ))}
                {box.sparks.map((s, i) => (
                  <div key={`s${i}`} className="candy-twinkle absolute" style={{ left: `${s.left}%`, top: s.top, animationDelay: `-${s.delay.toFixed(1)}s` }}><Sparkle size={s.size} /></div>
                ))}
              </div>
            );
          })}

          {/* the lane: road, banners, gates, lessons */}
          <div className="absolute left-1/2 top-0 w-[min(41rem,100%)] -translate-x-1/2" style={{ height: map.height }}>
            <svg aria-hidden="true" focusable="false" viewBox={`0 0 100 ${map.height}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <path d={road} fill="none" stroke="var(--candy-path-shadow)" strokeWidth="54" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(0 8)" />
              <path d={road} fill="none" stroke="var(--candy-white)" strokeWidth="50" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={road} fill="none" stroke="var(--candy-path-bed)" strokeWidth="38" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={road} fill="none" stroke="var(--candy-white)" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 26" vectorEffect="non-scaling-stroke" />
              {roadDone && <path d={roadDone} fill="none" stroke="var(--candy-path-done)" strokeWidth="38" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
              {roadDone && <path d={roadDone} fill="none" stroke="var(--candy-white)" strokeWidth="38" strokeDasharray="14 18" vectorEffect="non-scaling-stroke" />}
            </svg>

            {units.map((unit, ui) => {
              const box = map.units[ui];
              const done = unit.lessons.filter((l) => lessonStatus(l, progress) === 'completed').length;
              const all = done === unit.lessons.length;
              return (
                <div key={unit.code} className={`candy-world-${(ui % 3) + 1}`}>
                  <section aria-labelledby={`unit-${unit.code}`} className="absolute left-1/2 z-[9] flex w-[min(94%,32.5rem)] -translate-x-1/2 flex-col items-center" style={{ top: box.bannerY }}>
                    <div className="candy-ribbon flex w-full flex-col items-center gap-0.5 rounded-lg px-14 pb-5 pt-4">
                      <p className="text-[13px] font-black uppercase tracking-[0.18em]">{t.level(unit.level)}</p>
                      <h2 id={`unit-${unit.code}`} className="text-center text-[1.75rem] font-black leading-tight">{unit.title}</h2>
                    </div>
                    <div className="candy-counter relative -mt-2.5 flex h-8 w-40 items-center justify-center overflow-hidden rounded-full border-4 bg-surface">
                      <div aria-hidden="true" className="candy-counter-fill absolute inset-y-0 left-0" style={{ width: `${Math.round((done / unit.lessons.length) * 100)}%` }} />
                      <span className="relative text-[15px] font-black">{t.unitCount(done, unit.lessons.length)}</span>
                    </div>
                  </section>
                  <div className="absolute left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-1.5" style={{ top: box.gateY }}>
                    <span aria-hidden="true" className={`inline-flex size-[4.6rem] items-center justify-center rounded-[1.4rem] border-[5px] border-surface text-text-on-brand ${all ? 'candy-gate-done' : 'candy-gate'}`}>
                      <TrophyIcon className="size-9" />
                    </span>
                    <span className="candy-flag rounded-full bg-surface px-3.5 py-1 text-sm font-black">{all ? t.gateDone(t.level(unit.level)) : t.gateTodo(t.level(unit.level))}</span>
                  </div>
                </div>
              );
            })}

            <ol className="contents">
              {units.map((unit, ui) => unit.lessons.map((lesson, li) => {
                const idx = g++;
                const status = statuses[idx];
                const { x, y } = map.units[ui].nodes[li];
                const locked = status === 'locked';
                const big = idx === firstOpen;
                const size = big ? 104 : 90;
                const expanded = open === lesson.code;
                const glosses = lessonGlosses(lesson, glossOf);
                const chips = glosses.length > MAX_CHIPS ? [...glosses.slice(0, MAX_CHIPS - 1), '…'] : glosses;
                const shift = (Math.min(72, Math.max(28, x)) - x) * LANE_PX_PER_PCT;
                return (
                  <li
                    key={lesson.code}
                    className={`candy-world-${(ui % 3) + 1} absolute flex flex-col items-center gap-1.5`}
                    style={{ left: `${x}%`, top: y - size / 2, width: size, marginLeft: -size / 2, zIndex: expanded ? 25 : 6 }}
                  >
                    {big && (
                      <>
                        <span aria-hidden="true" className="candy-ring absolute left-0 top-0 size-[6.5rem] rounded-full border-[6px] border-surface" />
                        {!expanded && (
                          <span aria-hidden="true" className="candy-bubble absolute left-[calc(100%+0.75rem)] top-[3.25rem] -translate-y-1/2 whitespace-nowrap rounded-full border-4 border-brand-500 bg-surface px-3 py-1 text-sm font-black text-brand-fg shadow-[0_4px_0_var(--btn-pink-lip)]">
                            {t.next}
                          </span>
                        )}
                      </>
                    )}
                    <SkillNode title={lesson.title} status={status} expanded={expanded} number={idx + 1} big={big} onSelect={() => setOpen(expanded ? null : lesson.code)} />
                    {status === 'completed' && (
                      <span aria-hidden="true" className="absolute -top-4 left-1/2 inline-flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-surface text-[var(--candy-gold)] shadow-[0_3px_0_var(--candy-gold-lip)]">
                        <StarIcon className="size-6 fill-current" />
                      </span>
                    )}
                    <span className={`whitespace-nowrap rounded-full border-[3px] border-surface px-3.5 py-0.5 text-[15px] font-black ${locked ? 'candy-tag-locked' : 'candy-tag'}`}>
                      {lesson.title.split(':')[0]}
                    </span>
                    {chips.length > 0 && (
                      <span aria-hidden="true" className="flex max-w-52 flex-wrap justify-center gap-1">
                        {chips.map((c) => (
                          <span key={c} className={`inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-[9px] border-2 border-surface px-1.5 text-[15px] font-black ${locked ? 'candy-chip-locked' : 'candy-chip'}`}>{c}</span>
                        ))}
                      </span>
                    )}

                    {expanded && (
                      <div
                        role="group"
                        aria-label={t.popover(lesson.title)}
                        onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}
                        className={`popover-pop absolute left-1/2 flex w-72 flex-col items-center gap-2.5 rounded-[1.75rem] border-[5px] bg-surface p-[18px] text-center ${locked ? 'candy-popover-locked border-[var(--candy-locked-chip)]' : 'candy-popover border-brand-200'}`}
                        style={{ top: size + 70, transform: `translateX(calc(-50% + ${shift}px))` }}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-fg">{t.level(unit.level)} · {unit.title}</p>
                        <p className="text-[1.4rem] font-black text-text">{lesson.title}</p>
                        {locked ? (
                          <p className="flex items-center gap-2 rounded-2xl bg-[var(--candy-locked-chip)] px-3 py-2.5 text-sm text-[var(--candy-locked-ink)]">
                            <LockIcon className="size-[18px] shrink-0" />{t.lockedHint}
                          </p>
                        ) : (
                          <>
                            <p className="rounded-full bg-brand-50 px-3.5 py-1 text-[13px] font-extrabold text-brand-fg">
                              {t.items(lesson.items.length)} · {t.xp(lesson.xp_reward)}
                            </p>
                            <Link
                              to={`/lesson/${lesson.code}`}
                              className="btn-pink inline-flex min-h-[3.4rem] w-full items-center justify-center gap-2 rounded-full text-lg font-black text-ink-on-pink"
                            >
                              <PlayIcon className="size-[18px]" />
                              {status === 'completed' ? t.again : t.start}
                            </Link>
                          </>
                        )}
                        <button type="button" onClick={() => setOpen(null)} className="min-h-11 cursor-pointer px-3 text-sm font-extrabold text-brand-fg">{t.close}</button>
                      </div>
                    )}
                  </li>
                );
              }))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
