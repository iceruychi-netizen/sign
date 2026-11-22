import type { HTMLAttributes } from 'react';

const VARIANTS = {
  default: '',
  interactive: 'cursor-pointer hover:-translate-y-0.5 hover:border-(--kw-line) hover:bg-brand-50/40 hover:shadow-(--kw-card-shadow-hover)',
  selected: 'border-brand-400 bg-brand-50 shadow-(--kw-card-shadow-hover)',
} as const;

type Props = HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof VARIANTS };

/** Kawaii card: white with a thick candy-pink border and a soft offset shadow. */
export function Card({ variant = 'default', className = '', ...rest }: Props) {
  return (
    <div
      {...rest}
      data-variant={variant}
      className={`rounded-3xl border-[3px] border-(--kw-line-soft) bg-surface p-5 shadow-(--kw-card-shadow) transition-[transform,box-shadow,border-color,background-color] duration-(--motion-fast) ${VARIANTS[variant]} ${className}`}
    />
  );
}
