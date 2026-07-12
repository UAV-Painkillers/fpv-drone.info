import {
  buildMdxComponents,
  ContentArticle,
  getGuideManifest,
  getGuideStepComponent,
  getGuideStepMeta,
} from '@fpv/content';
import { format, useT, type Locale } from '@fpv/i18n';
import { DonateCta, ExpandableImage, ProgressBar, Spinner } from '@fpv/ui';
import { MDXProvider } from '@mdx-js/react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { MDX_TOOLS } from '../../../../components/analyzer/mdx-tools';

export const Route = createFileRoute('/$locale/guides/$guideSlug/$stepSlug')({
  beforeLoad: ({ params }) => {
    if (
      !getGuideStepMeta(params.locale as Locale, params.guideSlug, params.stepSlug)
    ) {
      throw notFound();
    }
  },
  component: GuideStepPage,
});

function GuideStepPage() {
  const t = useT();
  const { locale, guideSlug, stepSlug } = Route.useParams();
  const guide = getGuideManifest(locale as Locale, guideSlug);
  const step = getGuideStepMeta(locale as Locale, guideSlug, stepSlug);
  const StepContent = getGuideStepComponent(locale as Locale, guideSlug, stepSlug);
  const components = useMemo(() => buildMdxComponents(MDX_TOOLS), []);

  if (!guide || !step || !StepContent) return null;

  const prev = guide.steps.find((s) => s.order === step.order - 1);
  const next = guide.steps.find((s) => s.order === step.order + 1);
  const isLast = !next;

  return (
    <div className="animate-fade-in">
      {/* wizard header */}
      <div className="mb-4">
        <Link
          to="/$locale/guides/$guideSlug"
          params={{ locale, guideSlug }}
          className="text-sm font-semibold text-ink-muted hover:text-ink"
        >
          ← {guide.title}
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar
            value={step.order / guide.stepCount}
            label={format(t.guides.stepOf, {
              current: step.order,
              total: guide.stepCount,
            })}
            className="max-w-xs"
          />
          <span className="text-xs font-semibold whitespace-nowrap text-ink-muted">
            {format(t.guides.stepOf, {
              current: step.order,
              total: guide.stepCount,
            })}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">
          <span className="mr-2 text-gradient">{step.index}</span>
          {step.title}
        </h1>
      </div>

      {step.image ? (
        <div className="mb-4 max-w-xl">
          <ExpandableImage src={step.image} alt={step.title} />
        </div>
      ) : null}

      <Suspense
        fallback={
          <div className="flex items-center gap-2 py-8 text-ink-muted">
            <Spinner /> …
          </div>
        }
      >
        <ContentArticle>
          <MDXProvider components={components}>
            <StepContent />
          </MDXProvider>
        </ContentArticle>
      </Suspense>

      {isLast ? (
        <div className="mt-8">
          <DonateCta
            title={t.donate.cta.title}
            body={t.donate.cta.body}
            buttonLabel={t.donate.cta.button}
          />
        </div>
      ) : null}

      {/* prev / next */}
      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-4">
        {prev ? (
          <Link
            to="/$locale/guides/$guideSlug/$stepSlug"
            params={{ locale, guideSlug, stepSlug: prev.slug }}
            className="inline-flex h-11 items-center rounded-(--radius-control) border border-line bg-surface-raised px-4 text-sm font-semibold hover:border-brand-green"
          >
            ← {t.guides.previous}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/$locale/guides/$guideSlug/$stepSlug"
            params={{ locale, guideSlug, stepSlug: next.slug }}
            className="inline-flex h-11 items-center rounded-(--radius-control) bg-brand-gradient px-5 text-sm font-semibold text-white shadow-md shadow-brand-blue/20 hover:brightness-110"
          >
            {t.guides.next} →
          </Link>
        ) : (
          <Link
            to="/$locale/guides"
            params={{ locale }}
            className="inline-flex h-11 items-center rounded-(--radius-control) bg-brand-gradient px-5 text-sm font-semibold text-white shadow-md shadow-brand-blue/20 hover:brightness-110"
          >
            {t.guides.finish} ✓
          </Link>
        )}
      </nav>
    </div>
  );
}
