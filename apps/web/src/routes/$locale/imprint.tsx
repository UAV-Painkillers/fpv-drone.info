import { useT } from '@fpv/i18n';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/imprint')({
  component: ImprintPage,
});

function ImprintPage() {
  const t = useT();
  return (
    <div className="prose-page animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.nav.imprint}</h1>
      {/* Migrated legal content lands here in Phase 4 */}
    </div>
  );
}
