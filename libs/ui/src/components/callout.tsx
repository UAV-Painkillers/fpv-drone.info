import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger' | 'tldr';

const TONE_CLASSES: Record<CalloutTone, string> = {
  info: 'border-brand-blue/40 bg-brand-blue-soft',
  success: 'border-success/40 bg-success/10',
  warning: 'border-warning/40 bg-warning/10',
  danger: 'border-danger/40 bg-danger/10',
  tldr: 'border-brand-green/40 bg-brand-green-soft',
};

const TONE_ICONS: Record<CalloutTone, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  danger: '🔥',
  tldr: '🦝',
};

export interface CalloutProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
}

export function Callout({
  tone = 'info',
  title,
  children,
  className,
  ...rest
}: CalloutProps) {
  return (
    <div
      className={clsx(
        'my-4 rounded-(--radius-control) border-l-4 px-4 py-3 text-sm',
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    >
      {title ? (
        <p className="mb-1 flex items-center gap-2 font-bold">
          <span aria-hidden>{TONE_ICONS[tone]}</span>
          {title}
        </p>
      ) : null}
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

export function Tldr({ children }: { children?: ReactNode }) {
  return (
    <Callout tone="tldr" title="TL;DR">
      {children}
    </Callout>
  );
}
