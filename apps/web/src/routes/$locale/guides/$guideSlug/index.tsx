import { getGuideManifest } from '@fpv/content';
import { useT, type Locale } from '@fpv/i18n';
import { Card, ExpandableImage, MascotImage } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/guides/$guideSlug/')({
  component: GuideLanding,
});

function GuideLanding() {
  const t = useT();
  const { locale, guideSlug } = Route.useParams();
  const guide = getGuideManifest(locale as Locale, guideSlug);
  if (!guide) return null;

  const firstStep = guide.steps[0];
  const mascot = guideSlug.includes('filter') ? 'directionFilter' : 'directionPid';

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{guide.title}</h1>
          {guide.subtitle ? (
            <p className="mt-1 text-ink-muted">{guide.subtitle}</p>
          ) : null}
        </div>
        <MascotImage name={mascot} alt="" className="hidden w-28 sm:block" />
      </div>

      {guide.prerequisites?.length ? (
        <Card className="mt-6">
          <h2 className="text-lg font-bold">
            {guide.prerequisitesTitle ?? t.guides.prerequisites}
          </h2>
          <ul className="mt-3 space-y-2">
            {guide.prerequisites.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-success">✓</span>
                {item}
              </li>
            ))}
          </ul>
          {guide.prerequisitesImage ? (
            <div className="mt-4 max-w-xl">
              <ExpandableImage
                src={guide.prerequisitesImage}
                alt={guide.prerequisitesTitle ?? ''}
              />
            </div>
          ) : null}
        </Card>
      ) : null}

      <h2 className="mt-8 text-lg font-bold">
        {t.guides.steps} ({guide.stepCount})
      </h2>
      <ol className="mt-3 space-y-1.5">
        {guide.steps.map((step) => (
          <li key={step.slug}>
            <Link
              to="/$locale/guides/$guideSlug/$stepSlug"
              params={{ locale, guideSlug, stepSlug: step.slug }}
              className="flex items-center gap-3 rounded-(--radius-control) border border-line bg-surface-raised px-4 py-2.5 text-sm font-semibold transition hover:border-brand-green hover:text-brand-green"
            >
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-blue-soft px-1 text-xs font-bold text-brand-blue">
                {step.index}
              </span>
              {step.title}
            </Link>
          </li>
        ))}
      </ol>

      {firstStep ? (
        <Link
          to="/$locale/guides/$guideSlug/$stepSlug"
          params={{ locale, guideSlug, stepSlug: firstStep.slug }}
          className="mt-6 inline-flex h-12 items-center rounded-(--radius-control) bg-brand-gradient px-6 font-semibold text-white shadow-md shadow-brand-blue/20 transition hover:brightness-110"
        >
          {t.guides.startGuide} →
        </Link>
      ) : null}
    </div>
  );
}
