import { LOCALES, LOCALE_LABELS } from '@fpv/i18n';
import { Logo, MascotImage } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

// Prerendered locale chooser at "/". The inline script redirects to the
// best matching browser language before paint; the links are the no-JS
// and crawler fallback.
const REDIRECT_SCRIPT = `(function(){try{var s=["${LOCALES.join('","')}"];var ls=(navigator.languages||[navigator.language||"en"]).map(function(l){return l.slice(0,2).toLowerCase()});for(var i=0;i<ls.length;i++){if(s.indexOf(ls[i])>-1){location.replace("/"+ls[i]);return}}location.replace("/en")}catch(e){location.replace("/en")}})()`;

export const Route = createFileRoute('/')({
  head: () => ({
    scripts: [{ children: REDIRECT_SCRIPT }],
  }),
  component: LocaleChooser,
});

function LocaleChooser() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo className="scale-125" />
      <MascotImage name="friends" alt="Raccoon crew" className="w-56 max-w-full" />
      <nav aria-label="Languages" className="flex flex-wrap justify-center gap-3">
        {LOCALES.map((locale) => (
          <Link
            key={locale}
            to="/$locale"
            params={{ locale }}
            className="rounded-full border border-line bg-surface-raised px-5 py-2 font-semibold hover:border-brand-green hover:text-brand-green"
          >
            {LOCALE_LABELS[locale]}
          </Link>
        ))}
      </nav>
    </main>
  );
}
