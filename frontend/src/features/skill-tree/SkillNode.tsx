import { LockIcon } from '@/components/ui/Icons';
import { vi } from '@/i18n/vi';
import type { LessonStatus } from '@/game/unlock';

/** Candy look per status; in_progress shares the "open" candy since the lesson can be continued. */
const LOOK: Record<LessonStatus, { node: string; num: string }> = {
  locked: { node: 'candy-node-locked cursor-not-allowed', num: '' },
  available: { node: 'candy-node-available cursor-pointer', num: 'candy-num-available' },
  in_progress: { node: 'candy-node-available cursor-pointer', num: 'candy-num-available' },
  completed: { node: 'candy-node-completed cursor-pointer', num: 'candy-num-completed' },
};

/**
 * One lesson on the candy map: a round glossy sweet with the lesson number (a lock when closed).
 * The status is always spelled out in the accessible name, never only by colour.
 */
export function SkillNode({ title, status, expanded, onSelect, number, big = false }: {
  title: string; status: LessonStatus; expanded: boolean; onSelect: () => void; number: number; big?: boolean;
}) {
  const locked = status === 'locked';
  const look = LOOK[status];
  return (
    <button
      type="button"
      aria-label={vi.learn.node(title, vi.learn.status[status])}
      aria-expanded={expanded}
      data-status={status}
      onClick={onSelect}
      className={`candy-node relative flex shrink-0 items-center justify-center overflow-hidden rounded-full p-0 transition-transform duration-(--motion-fast) ${big ? 'size-[6.5rem]' : 'size-[5.625rem]'} ${look.node} ${locked ? '' : 'hover:-translate-y-1 hover:scale-105 active:translate-y-1'}`}
    >
      <span aria-hidden="true" className="absolute left-[18%] top-[12%] h-[20%] w-[34%] -rotate-[25deg] rounded-full bg-surface/55" />
      {locked ? (
        <LockIcon className="relative size-8" />
      ) : (
        <span aria-hidden="true" className={`relative font-black leading-none ${big ? 'text-5xl' : 'text-[2.4rem]'} ${look.num}`}>{number}</span>
      )}
    </button>
  );
}
