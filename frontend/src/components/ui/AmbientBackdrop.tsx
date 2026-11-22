import { Mascot } from '@/components/ui/Mascot';

type Variant = 'marketing' | 'app';

/** Kawaii backdrop: pastel sky with soft clouds; on marketing pages Lingo the cat waves from the corner. */
export function AmbientBackdrop({ variant = 'marketing' }: { variant?: Variant }) {
  return (
    <div aria-hidden="true" className="kw-sky kw-clouds pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {variant === 'marketing' && (
        <Mascot pose="wave" motion="sway" className="absolute bottom-4 right-4 hidden w-36 opacity-95 lg:block" />
      )}
    </div>
  );
}
