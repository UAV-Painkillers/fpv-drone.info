import { useT } from '@fpv/i18n';
import { Callout } from '@fpv/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/tools/blackbox-analyzer')({
  component: BlackboxAnalyzerPage,
});

function BlackboxAnalyzerPage() {
  const t = useT();
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.analyzer.title}</h1>
      <p className="mt-1 text-ink-muted">{t.analyzer.description}</p>
      {/* The analyzer widget lands here in Phase 5 */}
      <Callout tone="info" title="Coming right up" className="mt-6">
        The analyzer is being ported to the new app.
      </Callout>
    </div>
  );
}
