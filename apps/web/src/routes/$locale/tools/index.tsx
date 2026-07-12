import { MESSAGES, useT, type Locale } from '@fpv/i18n';
import { buildSeo } from '../../../seo';
import { Card } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/tools/')({
  head: ({ params }) => {
    const t = MESSAGES[params.locale as Locale] ?? MESSAGES.en;
    return buildSeo({
      locale: params.locale,
      path: '/tools',
      title: t.tools.title,
      description: t.tools.subtitle,
    });
  },
  component: ToolsIndex,
});

function ToolsIndex() {
  const t = useT();
  const { locale } = Route.useParams();
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.tools.title}</h1>
      <p className="mt-1 text-ink-muted">{t.tools.subtitle}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/$locale/tools/blackbox-analyzer" params={{ locale }} className="group block">
          <Card className="transition group-hover:-translate-y-0.5 group-hover:shadow-md">
            <h2 className="font-bold">{t.nav.analyzer}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t.analyzer.description}</p>
          </Card>
        </Link>
        <Link
          to="/$locale/tools/dynamic-idle-calculator"
          params={{ locale }}
          className="group block"
        >
          <Card className="transition group-hover:-translate-y-0.5 group-hover:shadow-md">
            <h2 className="font-bold">{t.nav.idleCalculator}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {t.idleCalculator.description}
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
