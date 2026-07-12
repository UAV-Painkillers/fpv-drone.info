import { useLocale, useT } from '@fpv/i18n';
import {
  Callout,
  DonateCta,
  ExpandableImage,
  Tldr,
} from '@fpv/ui';
import type { MDXComponents } from 'mdx/types';
import type { ComponentType, ReactNode } from 'react';

export interface SponsorItem {
  href: string;
  logo: string;
  name: string;
}

function Sponsors({ items }: { items: SponsorItem[] }) {
  return (
    <ul className="my-4 flex list-none flex-wrap items-center gap-6 p-0">
      {items.map((s) => (
        <li key={s.name}>
          <a href={s.href} target="_blank" rel="noreferrer sponsored">
            <img
              src={s.logo}
              alt={s.name}
              loading="lazy"
              className="h-10 w-auto opacity-80 transition hover:opacity-100 dark:rounded dark:bg-white/90 dark:p-1"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}

function ContentLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const locale = useLocale();
  const external = props.href?.startsWith('http') ?? false;
  // Internal content links are stored locale-less; prefix at render time.
  const href =
    props.href && props.href.startsWith('/') && !props.href.startsWith('/guide-images')
      ? `/${locale}${props.href}`
      : props.href;
  return (
    <a
      className="font-semibold text-brand-blue underline decoration-brand-green/50 underline-offset-2 hover:decoration-brand-green"
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      {...props}
      href={href}
    />
  );
}

function Donate() {
  const t = useT();
  return (
    <DonateCta
      title={t.donate.cta.title}
      body={t.donate.cta.body}
      buttonLabel={t.donate.cta.button}
    />
  );
}

export interface ToolComponents {
  /** Real interactive widgets are injected by the app (analyzer lib). */
  BlackboxAnalyzer?: ComponentType<{
    activePlots?: string[];
    navigation?: string[];
    plotLabels?: Record<string, { template: string; headerField: string }>;
  }>;
  DynamicIdleCalculator?: ComponentType;
}

function MissingTool({ name }: { name: string }) {
  return (
    <Callout tone="warning" title={name}>
      This interactive tool could not be loaded.
    </Callout>
  );
}

/**
 * Component mapping for migrated MDX content. Tool widgets (analyzer,
 * calculator) are supplied by the app to keep lib boundaries clean.
 */
export function buildMdxComponents(tools: ToolComponents = {}): MDXComponents {
  return {
    Callout,
    Tldr,
    ExpandableImage,
    Sponsors,
    Donate,
    BlackboxAnalyzer:
      tools.BlackboxAnalyzer ?? (() => <MissingTool name="Blackbox Analyzer" />),
    DynamicIdleCalculator:
      tools.DynamicIdleCalculator ??
      (() => <MissingTool name="Dynamic Idle Calculator" />),
    // long-form typography for markdown elements; text stays at a readable
    // measure while interactive embeds (plots!) can use the full width
    h2: (props) => <h2 className="mt-8 mb-3 max-w-2xl text-xl font-bold" {...props} />,
    h3: (props) => <h3 className="mt-6 mb-2 max-w-2xl text-lg font-bold" {...props} />,
    h4: (props) => <h4 className="mt-4 mb-2 max-w-2xl font-bold" {...props} />,
    p: (props) => <p className="my-3 max-w-2xl leading-relaxed" {...props} />,
    ul: (props) => <ul className="my-3 max-w-2xl list-disc space-y-1 pl-6" {...props} />,
    ol: (props) => (
      <ol className="my-3 max-w-2xl list-decimal space-y-2 pl-6" {...props} />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    a: ContentLink,
    img: ({ src, alt }) => (
      <ExpandableImage src={typeof src === 'string' ? src : ''} alt={alt ?? ''} />
    ),
    blockquote: (props) => (
      <blockquote
        className="my-3 border-l-4 border-brand-green/50 pl-4 text-ink-muted italic"
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-sm"
        {...props}
      />
    ),
    hr: () => <hr className="my-6 border-line" />,
  };
}

export function ContentArticle({ children }: { children: ReactNode }) {
  return <article className="text-[15px]">{children}</article>;
}
