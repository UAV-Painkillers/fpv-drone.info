/**
 * Matomo-only analytics (port of the original utils/analytics.ts, minus
 * Vercel Analytics and ads). Cookieless-friendly self-hosted instance;
 * the tracker script is loaded as "not_matomo.js" from the analytics host
 * to survive overzealous adblockers — same trick as before.
 */

declare global {
  interface Window {
    Matomo?: {
      getTracker: () => {
        trackEvent: (
          category: string,
          action: string,
          name?: string,
          value?: number,
        ) => void;
      };
    };
    _paq?: unknown[][];
  }
}

const MATOMO_HOST = import.meta.env['VITE_MATOMO_HOST'] as string | undefined;

export function initAnalytics() {
  if (!MATOMO_HOST || !import.meta.env.PROD) return;
  if (typeof window === 'undefined' || window._paq) return;

  const host = `//${MATOMO_HOST}/`;
  const _paq: unknown[][] = (window._paq = window._paq ?? []);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  _paq.push(['setTrackerUrl', `${host}matomo.php`]);
  _paq.push(['setSiteId', '1']);

  const script = document.createElement('script');
  script.async = true;
  script.src = `${host}not_matomo.js`;
  document.head.appendChild(script);
}

export function trackPageView(url: string) {
  window._paq?.push(['setCustomUrl', url]);
  window._paq?.push(['trackPageView']);
}

export function trackEvent(category: string, action: string) {
  if (!window.Matomo) return;
  try {
    window.Matomo.getTracker().trackEvent(category, action, `${category}:${action}`, 1);
  } catch {
    // analytics must never break the app
  }
}
