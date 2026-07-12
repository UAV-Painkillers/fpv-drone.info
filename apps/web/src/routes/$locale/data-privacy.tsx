import { getPage } from '@fpv/content';
import { type Locale } from '@fpv/i18n';
import { createFileRoute } from '@tanstack/react-router';
import { MdxArticle } from '../../components/mdx-page';

export const Route = createFileRoute('/$locale/data-privacy')({
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
