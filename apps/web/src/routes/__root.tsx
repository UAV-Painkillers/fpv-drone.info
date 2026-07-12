import { DEFAULT_LOCALE, isLocale } from '@fpv/i18n';
import { registerServiceWorker } from '@fpv/pwa';
import { ErrorRaccoon, THEME_INIT_SCRIPT } from '@fpv/ui';
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { initAnalytics, trackPageView } from '../analytics';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'fpv-drone.info' },
      { name: 'theme-color', content: '#16c99e' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/pwa/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/pwa/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { rel: 'apple-touch-icon', href: '/pwa/apple-touch-icon.png' },
      { rel: 'manifest', href: '/pwa/site.webmanifest' },
    ],
    scripts: [{ children: THEME_INIT_SCRIPT }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  useEffect(() => {
    registerServiceWorker();
    initAnalytics();
    // SPA page views on client-side navigation
    return router.subscribe('onResolved', ({ toLocation }) => {
      trackPageView(toLocation.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Outlet />;
}

function RootDocument({ children }: { children: ReactNode }) {
  const params = useParams({ strict: false }) as { locale?: string };
  const lang =
    params.locale && isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6">
      <ErrorRaccoon title="404">
        <p>This page does not exist (anymore).</p>
        <Link to="/" className="mt-2 inline-block font-semibold text-gradient">
          fpv-drone.info
        </Link>
      </ErrorRaccoon>
    </main>
  );
}
