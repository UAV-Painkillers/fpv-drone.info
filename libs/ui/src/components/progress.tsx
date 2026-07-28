import clsx from 'clsx';

export interface ProgressBarProps {
  /** 0..1; omit for an indeterminate shimmer. */
  value?: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const determinate = typeof value === 'number';
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? Math.round(value * 100) : undefined}
      aria-label={label}
      className={clsx(
        'h-2 w-full overflow-hidden rounded-full bg-surface-sunken',
        className,
      )}
    >
      <div
        className={clsx(
          'h-full rounded-full bg-brand-gradient transition-[width] duration-300',
          !determinate && 'w-1/3 animate-pulse',
        )}
        style={determinate ? { width: `${Math.min(100, value * 100)}%` } : undefined}
      />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-green',
        className,
      )}
    />
  );
}
