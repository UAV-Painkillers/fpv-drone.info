import { getGuideManifest } from '@fpv/content';
import { isLocale } from '@fpv/i18n';
import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/guides/$guideSlug')({
  beforeLoad: ({ params }) => {
    if (
      !isLocale(params.locale) ||
      !getGuideManifest(params.locale, params.guideSlug)
    ) {
      throw notFound();
    }
  },
  component: Outlet,
});
