import { useT } from '@fpv/i18n';
import { Callout } from '@fpv/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/guides/filter-tuning')({
  component: FilterGuidePage,
});

function FilterGuidePage() {
  const t = useT();
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.nav.filterGuide}</h1>
      {/* Wizard engine + migrated content land here in Phases 4–6 */}
      <Callout tone="info" title="Coming right up" className="mt-6">
        The step-by-step guide is being migrated to the new app.
      </Callout>
    </div>
  );
}
