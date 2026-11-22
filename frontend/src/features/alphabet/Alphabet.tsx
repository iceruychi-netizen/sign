import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Sign } from '@/content/types';
import { loadLearnData, type LearnData } from '@/features/skill-tree/SkillTree';
import { HandIllustration } from '@/features/lesson/HandIllustration';
import { vi } from '@/i18n/vi';

const imageOf = (sign: Sign) => sign.media?.find((m) => m.type === 'image');

function Hand({ sign, className }: { sign: Sign; className: string }) {
  const image = imageOf(sign);
  return image
    ? <img src={image.src} alt={vi.lesson.cardImageAlt(sign.gloss)} className={`${className} object-contain`} />
    : <HandIllustration letter={sign.gloss} className={className} />;
}

/** One letter or number: large tile, handshape illustration, guidance, and neighbour navigation. */
function SignDetail({ signs, symbol }: { signs: Sign[]; symbol: string }) {
  const t = vi.alphabet;
  const i = signs.findIndex((s) => s.gloss === symbol);
  if (i < 0) return <p role="alert" className="font-bold">{t.unknown(symbol)}</p>;
  const sign = signs[i];
  const group = signs.filter((s) => s.code.startsWith(sign.code.startsWith('NUMBER_') ? 'NUMBER_' : 'LETTER_'));
  const gIdx = group.findIndex((s) => s.gloss === symbol);
  const image = imageOf(sign);
  const isDynamic = sign.kind === 'dynamic';
  const prev = group[gIdx - 1];
  const next = group[gIdx + 1];
  return (
    <Card className="flex flex-col items-center gap-6 px-5 py-8 text-center sm:px-8">
      <Link to="/alphabet" className="self-start rounded-full bg-brand-50 px-4 py-1.5 text-sm font-extrabold text-brand-fg transition-colors hover:bg-brand-100">
        ← {t.back}
      </Link>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <h1 className="rounded-full border border-brand-200 bg-brand-50 px-5 py-1.5 text-sm font-extrabold uppercase tracking-widest text-brand-fg">
          {vi.lesson.cardTitle(symbol)}
        </h1>
        {isDynamic && (
          <span className="btn-pink rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-ink-on-pink shadow-none">
            {t.dynamicBadge}
          </span>
        )}
      </div>
      <div key={symbol} className="sign-pop flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <p aria-hidden="true" className="unit-banner flex size-40 items-center justify-center rounded-[var(--radius-2xl)] text-8xl font-black text-ink-on-pink">
          {symbol}
        </p>
        <figure className="flex flex-col items-center gap-2.5">
          <div className="flex size-64 items-center justify-center rounded-[var(--radius-2xl)] border-2 border-brand-200 bg-brand-50 p-4 sm:size-72">
            <Hand sign={sign} className="size-full" />
          </div>
          {image && (
            <figcaption className="max-w-72 text-xs text-text-muted">
              {vi.lesson.cardImageCredit(image.attribution, image.license)}
            </figcaption>
          )}
        </figure>
      </div>
      <p className="max-w-md text-text-muted">{isDynamic ? t.howToDynamic(symbol) : t.howTo}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {prev && <Button variant="secondary" asChild><Link to={`/alphabet/${prev.gloss}`} aria-label={t.prev(prev.gloss)}>← {prev.gloss}</Link></Button>}
        <Button asChild><Link to={sign.code.startsWith('NUMBER_') ? '/learn' : '/practice'}>{t.practice}</Link></Button>
        {next && <Button variant="secondary" asChild><Link to={`/alphabet/${next.gloss}`} aria-label={t.next(next.gloss)}>{next.gloss} →</Link></Button>}
      </div>
    </Card>
  );
}

function SignGrid({ items }: { items: Sign[] }) {
  const t = vi.alphabet;
  return (
    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3.5 lg:grid-cols-6">
      {items.map((s) => (
        <li key={s.code}>
          <Link
            to={`/alphabet/${s.gloss}`}
            aria-label={t.open(s.gloss)}
            className="group relative flex flex-col items-center gap-2 rounded-3xl border-2 border-border bg-surface p-2 shadow-(--card-shadow) sm:p-3.5 transition-[transform,border-color,background-color,box-shadow] duration-(--motion-fast) hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-(--card-shadow-hover)"
          >
            {s.kind === 'dynamic' && (
              <span className="btn-pink absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase text-ink-on-pink shadow-none">
                {t.dynamicBadge}
              </span>
            )}
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-base font-black text-brand-fg transition-colors sm:size-10 sm:text-xl group-hover:bg-brand-200/70 group-hover:text-ink-on-pink">
              {s.gloss}
            </span>
            <Hand sign={s} className="size-14 transition-transform sm:size-20 duration-(--motion-bounce) group-hover:-rotate-3 group-hover:scale-110" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Reference dictionary: all 26 ASL letters (A–Z) and 11 basic numbers (0–10). */
export function Alphabet({ load = loadLearnData }: { load?: () => Promise<LearnData> }) {
  const t = vi.alphabet;
  const { letter } = useParams();
  const [signs, setSigns] = useState<Sign[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<'all' | 'letters' | 'numbers'>('all');

  useEffect(() => {
    let live = true;
    load()
      .then((d) => {
        if (!live) return;
        const letters = d.curriculum.signs.filter((s) => s.code.startsWith('LETTER_')).sort((a, b) => a.gloss.localeCompare(b.gloss));
        const numbers = d.curriculum.signs.filter((s) => s.code.startsWith('NUMBER_')).sort((a, b) => Number(a.gloss) - Number(b.gloss));
        setSigns([...letters, ...numbers]);
      })
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [load]);

  const status = failed
    ? <p role="alert" className="font-bold text-danger-on-bg">{t.loadError}</p>
    : !signs && <p className="text-text-muted">{vi.common.loading}</p>;
  if (letter && signs) return <section className="mx-auto max-w-3xl"><SignDetail signs={signs} symbol={letter.toUpperCase()} /></section>;

  const letters = (signs ?? []).filter((s) => s.code.startsWith('LETTER_'));
  const numbers = (signs ?? []).filter((s) => s.code.startsWith('NUMBER_'));
  const showLetters = filter === 'all' || filter === 'letters';
  const showNumbers = filter === 'all' || filter === 'numbers';

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text">{t.title}</h1>
          <p className="mt-1 text-text-muted">{t.intro}</p>
        </div>
        {signs && signs.length > 0 && (
          <div role="group" aria-label="Lọc danh mục ký hiệu" className="inline-flex flex-wrap gap-1.5 rounded-full border-2 border-border bg-surface p-1.5 shadow-(--card-shadow)">
            {([
              ['all', `Tất cả (${signs.length})`],
              ['letters', `${t.lettersTab} (${letters.length})`],
              ['numbers', `${t.numbersTab} (${numbers.length})`],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`min-h-9 cursor-pointer rounded-full px-4 text-xs font-extrabold transition-[background-color,color] duration-(--motion-fast) ${
                  filter === id ? 'btn-pink text-ink-on-pink shadow-none' : 'text-text-muted hover:bg-brand-50 hover:text-brand-fg'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      {status}
      {showLetters && letters.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black text-brand-fg">{t.lettersTab}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-extrabold text-brand-fg">
              {letters.length} chữ cái
            </span>
          </div>
          <SignGrid items={letters} />
        </div>
      )}
      {showNumbers && numbers.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black text-brand-fg">{t.numbersTab}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-extrabold text-brand-fg">
              {numbers.length} chữ số
            </span>
          </div>
          <SignGrid items={numbers} />
        </div>
      )}
      <p className="text-sm text-text-muted">{t.notIncluded}</p>
    </section>
  );
}
