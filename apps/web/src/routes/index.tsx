import { createFileRoute, Link } from '@tanstack/react-router';
import { LOCALES, LOCALE_LABELS } from '@fpv/i18n';

export const Route = createFileRoute('/')({
  component: LocaleChooser,
});

function LocaleChooser() {
  return (
    <main>
      <h1>fpv-drone.info</h1>
      <ul>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link to="/$locale" params={{ locale }}>
              {LOCALE_LABELS[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
