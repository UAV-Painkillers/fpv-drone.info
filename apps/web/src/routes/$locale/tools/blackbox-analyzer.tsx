import { getPage } from '@fpv/content';
import { useT, type Locale } from '@fpv/i18n';
import { createFileRoute } from '@tanstack/react-router';
import { MdxArticle } from '../../../components/mdx-page';

export const Route = createFileRoute('/$locale/tools/blackbox-analyzer')({
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
        {/* Real analyzer widget is injected in Phase 5 via the tools prop */}
        <MdxArticle Content={Content} />
      </div>
    </div>
  );
}
