import { isLocale, LocaleProvider, type Locale } from '@fpv/i18n';
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { AppShell } from '../../components/app-shell';

export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) {
      throw notFound();
    }
  },
  component: LocaleLayout,
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
