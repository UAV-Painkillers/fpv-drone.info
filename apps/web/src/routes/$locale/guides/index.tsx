import { useT } from '@fpv/i18n';
import { Card, MascotImage } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/guides/')({
  component: GuidesIndex,
});

function GuidesIndex() {
  const t = useT();
  const { locale } = Route.useParams();

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.guides.title}</h1>
      <p className="mt-1 text-ink-muted">{t.guides.subtitle}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/$locale/guides/pid-tuning" params={{ locale }} className="group block">
          <Card
            accent
            className="flex h-full flex-col items-center gap-3 text-center transition group-hover:-translate-y-0.5 group-hover:shadow-md"
          >
            <MascotImage
              name="pablo"
              alt="Pablo the magician raccoon"
              className="h-40 w-auto transition group-hover:scale-105"
            />
            <h2 className="text-lg font-bold">{t.guides.noob.title}</h2>
            <p className="text-sm text-ink-muted">{t.guides.noob.body}</p>
            <span className="mt-auto font-semibold text-gradient">
              {t.guides.noob.cta} →
            </span>
          </Card>
        </Link>
        <Link to="/$locale/tools/blackbox-analyzer" params={{ locale }} className="group block">
          <Card
            accent
            className="flex h-full flex-col items-center gap-3 text-center transition group-hover:-translate-y-0.5 group-hover:shadow-md"
          >
            <MascotImage
              name="chichi"
              alt="Chichi the scientist raccoon"
              className="h-40 w-auto transition group-hover:scale-105"
            />
            <h2 className="text-lg font-bold">{t.guides.pro.title}</h2>
            <p className="text-sm text-ink-muted">{t.guides.pro.body}</p>
            <span className="mt-auto font-semibold text-gradient">
              {t.guides.pro.cta} →
            </span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
