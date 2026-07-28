import { LOCALES, LOCALE_LABELS, useLocale, useT } from '@fpv/i18n';
import {
  DISCORD_URL,
  DonateButton,
  Logo,
  MASCOTS,
  ThemeToggle,
} from '@fpv/ui';
import { Link, type LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';
import { DropdownMenu } from 'radix-ui';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import {
  CalculatorIcon,
  ChartIcon,
  CompassIcon,
  HomeIcon,
  WrenchIcon,
} from './icons';

interface NavItem {
  to: LinkProps['to'];
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
  params?: Record<string, string>;
}

function useNav(): { primary: NavItem[]; sections: { title: string; items: NavItem[] }[] } {
  const t = useT();
  return {
    primary: [
      { to: '/$locale', label: t.nav.home, icon: HomeIcon, exact: true },
      { to: '/$locale/tools', label: t.nav.tools, icon: WrenchIcon },
      { to: '/$locale/guides', label: t.nav.guides, icon: CompassIcon },
    ],
    sections: [
      {
        title: t.nav.tools,
        items: [
          {
            to: '/$locale/tools/blackbox-analyzer',
            label: t.nav.analyzer,
            icon: ChartIcon,
          },
          {
            to: '/$locale/tools/dynamic-idle-calculator',
            label: t.nav.idleCalculator,
            icon: CalculatorIcon,
          },
        ],
      },
      {
        title: t.nav.guides,
        items: [
          {
            to: '/$locale/guides/$guideSlug',
            params: { guideSlug: 'pid-tuning' },
            label: t.nav.pidGuide,
            icon: CompassIcon,
          },
          {
            to: '/$locale/guides/$guideSlug',
            params: { guideSlug: 'filter-tuning' },
            label: t.nav.filterGuide,
            icon: CompassIcon,
          },
        ],
      },
    ],
  };
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const locale = useLocale();
  return (
    <Link
      to={item.to}
      // `to` is a union of routes here, so params can't be narrowed statically
      params={{ locale, ...item.params } as never}
      onClick={onNavigate}
      activeOptions={{ exact: item.exact ?? false }}
      activeProps={{
        className: 'bg-brand-blue-soft text-brand-blue font-semibold',
      }}
      inactiveProps={{
        className: 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
      }}
      className="flex items-center gap-3 rounded-(--radius-control) px-3 py-2 text-sm transition"
    >
      <item.icon width={18} height={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function LanguageMenu() {
  const locale = useLocale();
  const t = useT();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={t.nav.language}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2 hover:bg-surface-sunken"
      >
        <img src={MASCOTS.froggo} alt="" className="h-6 w-6 object-contain" aria-hidden />
        <span className="text-sm font-semibold uppercase">{locale}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-36 rounded-(--radius-control) border border-line bg-surface-raised p-1 shadow-lg animate-fade-in"
        >
          {LOCALES.map((target) => (
            <DropdownMenu.Item key={target} asChild>
              <Link
                to="."
                params={(prev) => ({ ...prev, locale: target })}
                className={clsx(
                  'block cursor-pointer rounded-[calc(var(--radius-control)-4px)] px-3 py-2 text-sm outline-none',
                  'hover:bg-surface-sunken focus:bg-surface-sunken',
                  target === locale && 'font-bold text-brand-blue',
                )}
              >
                {LOCALE_LABELS[target]}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT();
  const locale = useLocale();
  const nav = useNav();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface-raised/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/$locale" params={{ locale }} aria-label={t.nav.home}>
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageMenu />
            <ThemeToggle label={t.nav.toggleTheme} />
            <DonateButton label={t.donate.button} className="max-sm:hidden" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4">
        {/* Sidebar (≥ md) */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 flex-col gap-5 overflow-y-auto py-6 md:flex">
          <nav aria-label="Main" className="flex flex-col gap-1">
            {nav.primary.map((item) => (
              <NavLink key={item.to} item={item} />
            ))}
          </nav>
          {nav.sections.map((section) => (
            <nav key={section.title} aria-label={section.title} className="flex flex-col gap-1">
              <p className="px-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink key={item.to} item={item} />
              ))}
            </nav>
          ))}
          <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4 text-xs text-ink-muted">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3 hover:text-ink"
            >
              {t.nav.discord} ↗
            </a>
            <Link to="/$locale/imprint" params={{ locale }} className="px-3 hover:text-ink">
              {t.nav.imprint}
            </Link>
            <Link
              to="/$locale/data-privacy"
              params={{ locale }}
              className="px-3 hover:text-ink"
            >
              {t.nav.dataPrivacy}
            </Link>
            <p className="px-3 pt-1">
              <a
                href="https://uav-painkillers.de"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                © UAV Painkillers
              </a>
            </p>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 py-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface-raised/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16 items-stretch justify-around">
          {nav.primary.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              activeProps={{ className: 'text-brand-blue' }}
              inactiveProps={{ className: 'text-ink-muted' }}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold"
            >
              <item.icon width={22} height={22} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
