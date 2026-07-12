import { getGuideManifest } from '@fpv/content';
import { MESSAGES, useT, type Locale } from '@fpv/i18n';
import { buildSeo } from '../../../seo';
import { Card, MascotImage, type MascotName } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/guides/')({
  head: ({ params }) => {
    const t = MESSAGES[params.locale as Locale] ?? MESSAGES.en;
    return buildSeo({
      locale: params.locale,
      path: '/guides',
      title: t.guides.title,
      description: t.guides.subtitle,
    });
  },
  component: GuidesIndex,
});

function GuideCard({
  mascot,
  title,
  body,
  cta,
}: {
  mascot: MascotName;
  title: string;
  body?: string;
  cta: string;
}) {
  return (
    <Card
      accent
      className="flex h-full flex-col items-center gap-3 text-center transition group-hover:-translate-y-0.5 group-hover:shadow-md"
    >
      <MascotImage
        name={mascot}
        alt=""
        className="h-36 w-auto transition group-hover:scale-105"
      />
      <h2 className="text-lg font-bold">{title}</h2>
      {body ? <p className="text-sm text-ink-muted">{body}</p> : null}
      <span className="mt-auto font-semibold text-gradient">{cta} →</span>
    </Card>
  );
}

function GuidesIndex() {
  const t = useT();
  const { locale } = Route.useParams();
  const pid = getGuideManifest(locale as Locale, 'pid-tuning');
  const filter = getGuideManifest(locale as Locale, 'filter-tuning');

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-extrabold">{t.guides.title}</h1>
      <p className="mt-1 text-ink-muted">{t.guides.subtitle}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/$locale/guides/$guideSlug"
          params={{ locale, guideSlug: 'pid-tuning' }}
          className="group block"
        >
          <GuideCard
            mascot="pablo"
            title={pid?.title ?? t.nav.pidGuide}
            body={pid?.subtitle}
            cta={t.guides.noob.cta}
          />
        </Link>
        <Link
          to="/$locale/guides/$guideSlug"
          params={{ locale, guideSlug: 'filter-tuning' }}
          className="group block"
        >
          <GuideCard
            mascot="directionFilter"
            title={filter?.title ?? t.nav.filterGuide}
            body={filter?.subtitle}
            cta={t.guides.noob.cta}
          />
        </Link>
        <Link
          to="/$locale/tools/blackbox-analyzer"
          params={{ locale }}
          className="group block"
        >
          <GuideCard
            mascot="chichi"
            title={t.guides.pro.title}
            body={t.guides.pro.body}
            cta={t.guides.pro.cta}
          />
        </Link>
      </div>
    </div>
  );
}
