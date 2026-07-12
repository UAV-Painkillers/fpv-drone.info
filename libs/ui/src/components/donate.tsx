import clsx from 'clsx';
import type { ReactNode } from 'react';
import bmcEmoji from '../assets/bmc-emoji.svg';
import { Card } from './card';
import { MascotImage } from './mascots';

export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/uav.painkillers';
export const DISCORD_URL = 'https://discord.gg/eBv6Mke9NS';

/** Compact gradient donate button for the top bar. */
export function DonateButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <a
      href={BUY_ME_A_COFFEE_URL}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 text-sm font-semibold text-white',
        'shadow-md shadow-brand-blue/20 transition hover:brightness-110',
        className,
      )}
    >
      <img src={bmcEmoji} alt="" className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </a>
  );
}

export interface DonateCtaProps {
  title: string;
  body: ReactNode;
  buttonLabel: string;
  className?: string;
}

/**
 * "Buy me a raccoon" card — placed at the end of guides and after a
 * successful analysis. Donations keep the tools free, so this is
 * deliberately hard to miss (but still polite).
 */
export function DonateCta({ title, body, buttonLabel, className }: DonateCtaProps) {
  return (
    <Card accent className={clsx('flex items-center gap-4', className)}>
      <MascotImage
        name="coin"
        alt="Raccoon flipping a coin"
        className="hidden w-24 shrink-0 sm:block"
      />
      <div className="min-w-0">
        <p className="text-base font-bold">{title}</p>
        <div className="mt-1 text-sm text-ink-muted">{body}</div>
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-(--radius-control) bg-brand-gradient px-4 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <img src={bmcEmoji} alt="" className="h-4 w-4" aria-hidden />
          {buttonLabel}
        </a>
      </div>
    </Card>
  );
}
