import { useT } from '@fpv/i18n';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/data-privacy')({
  component: DataPrivacyPage,
});

function DataPrivacyPage() {
  const t = useT();
  return (
    <div className="prose-page animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.nav.dataPrivacy}</h1>
      {/* Migrated legal content lands here in Phase 4 */}
    </div>
  );
}
