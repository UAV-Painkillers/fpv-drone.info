import {
  buildMdxComponents,
  ContentArticle,
  type ToolComponents,
} from '@fpv/content';
import { MDXProvider } from '@mdx-js/react';
import type { MDXContent } from 'mdx/types';
import { useMemo } from 'react';

/**
 * Renders a migrated MDX document with the design-system component mapping.
 * Interactive tool widgets are injected here (app layer) so the content lib
 * stays free of analyzer dependencies.
 */
export function MdxArticle({
  Content,
  tools,
}: {
  Content: MDXContent;
  tools?: ToolComponents;
}) {
  const components = useMemo(() => buildMdxComponents(tools), [tools]);
  return (
    <ContentArticle>
      <MDXProvider components={components}>
        <Content />
      </MDXProvider>
    </ContentArticle>
  );
}
