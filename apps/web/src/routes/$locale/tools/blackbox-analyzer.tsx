import { getPage } from '@fpv/content';
import { MESSAGES, useT, type Locale } from '@fpv/i18n';
import { buildSeo } from '../../../seo';
import { OfflineDownloadCard } from '@fpv/pwa';
import { ClientOnly } from '@fpv/ui';
import { createFileRoute } from '@tanstack/react-router';
import { MDX_TOOLS } from '../../../components/analyzer/mdx-tools';
import { MdxArticle } from '../../../components/mdx-page';

export const Route = createFileRoute('/$locale/tools/blackbox-analyzer')({
  head: ({ params }) => {
    const t = MESSAGES[params.locale as Locale] ?? MESSAGES.en;
    return buildSeo({
      locale: params.locale,
      path: '/tools/blackbox-analyzer',
      title: t.analyzer.title,
      description: t.analyzer.description,
    });
  },
  component: BlackboxAnalyzerPage,
});

function BlackboxAnalyzerPage() {
  const t = useT();
  const { locale } = Route.useParams();
  // Migrated "pro" page: analyzer embed + sponsors + credits.
  const { Content } = getPage(locale as Locale, 'analyzer');
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.analyzer.title}</h1>
      <p className="mt-1 text-ink-muted">{t.analyzer.description}</p>
      <div className="mt-6">
        <MdxArticle Content={Content} tools={MDX_TOOLS} />
      </div>
      <ClientOnly>
        <OfflineDownloadCard />
      </ClientOnly>
    </div>
  );
}
