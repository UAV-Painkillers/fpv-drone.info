import { MESSAGES, useT, type Locale } from '@fpv/i18n';
import { buildSeo } from '../../../seo';
import { createFileRoute } from '@tanstack/react-router';
import { DynamicIdleCalculator } from '../../../components/analyzer/dynamic-idle-calculator';

export const Route = createFileRoute('/$locale/tools/dynamic-idle-calculator')({
  head: ({ params }) => {
    const t = MESSAGES[params.locale as Locale] ?? MESSAGES.en;
    return buildSeo({
      locale: params.locale,
      path: '/tools/dynamic-idle-calculator',
      title: t.idleCalculator.title,
      description: t.idleCalculator.description,
    });
  },
  component: DynamicIdleCalculatorPage,
});

function DynamicIdleCalculatorPage() {
  const t = useT();
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.idleCalculator.title}</h1>
      <p className="mt-1 text-ink-muted">{t.idleCalculator.description}</p>
      <div className="mt-6">
        <DynamicIdleCalculator />
      </div>
    </div>
  );
}
