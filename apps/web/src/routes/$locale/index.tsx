import { MESSAGES, useLocale, useT, type Locale } from '@fpv/i18n';
import { buildSeo } from '../../seo';
import { InstallBanner } from '@fpv/pwa';
import { Card, ClientOnly, DonateCta, MascotImage, type MascotName } from '@fpv/ui';
import { createFileRoute, Link, type LinkProps } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export const Route = createFileRoute('/$locale/')({
  head: ({ params }) => {
    const t = MESSAGES[params.locale as Locale] ?? MESSAGES.en;
    return buildSeo({
      locale: params.locale,
      path: '',
      title: t.meta.siteName,
      description: t.meta.description,
    });
  },
  component: Home,
});

function ToolCard({
  to,
  mascot,
  title,
  body,
  cta,
}: {
  to: LinkProps['to'];
  mascot: MascotName;
  title: string;
  body: ReactNode;
  cta: string;
}) {
  const locale = useLocale();
  return (
    // `to` is a union of routes here, so params can't be narrowed statically
    <Link to={to} params={{ locale } as never} className="group block h-full">
      <Card className="flex h-full flex-col items-start gap-3 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
        <MascotImage
          name={mascot}
          alt=""
          className="h-28 w-auto self-center transition group-hover:scale-105"
        />
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-ink-muted">{body}</p>
        <span className="mt-auto font-semibold text-gradient">{cta} →</span>
      </Card>
    </Link>
  );
}

function Home() {
  const t = useT();

  return (
    <div className="animate-fade-in">
      <ClientOnly>
        <InstallBanner />
      </ClientOnly>
      <section className="py-6 text-center md:py-10">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {t.home.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">{t.home.subtitle}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          to="/$locale/tools/blackbox-analyzer"
          mascot="chichi"
          title={t.home.analyzerCard.title}
          body={t.home.analyzerCard.body}
          cta={t.home.analyzerCard.cta}
        />
        <ToolCard
          to="/$locale/guides"
          mascot="pablo"
          title={t.home.guidesCard.title}
          body={t.home.guidesCard.body}
          cta={t.home.guidesCard.cta}
        />
        <ToolCard
          to="/$locale/tools/dynamic-idle-calculator"
          mascot="direction"
          title={t.home.calculatorCard.title}
          body={t.home.calculatorCard.body}
          cta={t.home.calculatorCard.cta}
        />
      </section>

      <section className="mt-8">
        <DonateCta
          title={t.donate.cta.title}
          body={t.donate.cta.body}
          buttonLabel={t.donate.cta.button}
        />
      </section>
    </div>
  );
}
