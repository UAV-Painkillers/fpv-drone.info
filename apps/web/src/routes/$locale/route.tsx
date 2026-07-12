import { isLocale, LocaleProvider, useT, type Locale } from '@fpv/i18n';
import { ErrorRaccoon } from '@fpv/ui';
import { createFileRoute, Link, notFound, Outlet } from '@tanstack/react-router';
import { AppShell } from '../../components/app-shell';

export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) {
      throw notFound();
    }
  },
  component: LocaleLayout,
  notFoundComponent: LocaleNotFound,
});

function LocaleLayout() {
  const { locale } = Route.useParams();
  return (
    <LocaleProvider locale={locale as Locale}>
      <AppShell>
        <Outlet />
      </AppShell>
    </LocaleProvider>
  );
}

function LocaleNotFound() {
  const params = Route.useParams() as { locale?: string };
  const locale = params.locale && isLocale(params.locale) ? params.locale : 'en';
  return (
    <LocaleProvider locale={locale}>
      <NotFoundContent locale={locale} />
    </LocaleProvider>
  );
}

function NotFoundContent({ locale }: { locale: Locale }) {
  const t = useT();
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6">
      <ErrorRaccoon title={`404 — ${t.notFound.title}`}>
        <p>{t.notFound.body}</p>
        <Link
          to="/$locale"
          params={{ locale }}
          className="mt-2 inline-block font-semibold text-gradient"
        >
          {t.notFound.backHome}
        </Link>
      </ErrorRaccoon>
    </main>
  );
}
