import clsx from 'clsx';
import logoMarkDark from '../assets/logo-mark_dark.webp';
import logoMark from '../assets/logo-mark.webp';

/** Raccoon logo mark + wordmark, swaps artwork for dark mode. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <img src={logoMark} alt="" aria-hidden className="h-9 w-auto dark:hidden" />
      <img
        src={logoMarkDark}
        alt=""
        aria-hidden
        className="hidden h-9 w-auto dark:inline"
      />
      <span className="text-base font-extrabold tracking-tight">
        fpv-drone<span className="text-gradient">.info</span>
      </span>
    </span>
  );
}
