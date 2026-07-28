import { getPage } from '@fpv/content';
import { type Locale } from '@fpv/i18n';
import { buildSeo } from '../../seo';
import { createFileRoute } from '@tanstack/react-router';
import { MdxArticle } from '../../components/mdx-page';

export const Route = createFileRoute('/$locale/data-privacy')({
  head: ({ params }) => {
    const { meta } = getPage(params.locale as Locale, 'data-privacy');
    return buildSeo({
      locale: params.locale,
      path: '/data-privacy',
      title: meta.title,
      description: meta.description,
    });
  },
  component: DataPrivacyPage,
});

function DataPrivacyPage() {
  const { locale } = Route.useParams();
  const { Content, meta } = getPage(locale as Locale, 'data-privacy');
  return (
    <div className="animate-fade-in">
      <h1 className="mb-4 text-2xl font-extrabold">{meta.title}</h1>
      <MdxArticle Content={Content} />
    </div>
  );
}
