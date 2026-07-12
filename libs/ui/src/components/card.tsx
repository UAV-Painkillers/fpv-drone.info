import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Renders a subtle gradient top border, used for featured cards. */
  accent?: boolean;
}

export function Card({ className, accent = false, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-(--radius-card) border border-line bg-surface-raised p-5 shadow-sm',
        accent &&
          'border-t-0 bg-[linear-gradient(var(--fpv-surface-raised),var(--fpv-surface-raised)),linear-gradient(90deg,var(--fpv-brand-green),var(--fpv-brand-blue))] [background-clip:padding-box,border-box] [background-origin:border-box] border-t-4',
        className,
      )}
      {...rest}
    />
  );
}
