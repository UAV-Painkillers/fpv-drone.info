/**
 * Umami analytics. Cookieless by design — no cookies, no cross-site
 * identifiers, no personal data leaving our own infrastructure.
 *
 * Auto-tracking is disabled so page views follow the router instead of the
 * history API, which keeps SPA navigations from being counted twice. The
 * tracker script is loaded asynchronously, so anything tracked before it is
 * ready is queued and flushed once it loads.
 */

type UmamiEventData = Record<string, string | number | boolean>;
type UmamiPayload = Record<string, unknown>;

declare global {
  interface Window {
    umami?: {
      track: {
        (payload: (props: UmamiPayload) => UmamiPayload): void;
        (eventName: string, eventData?: UmamiEventData): void;
      };
    };
  }
}

const UMAMI_HOST = import.meta.env['VITE_UMAMI_HOST'] as string | undefined;
const UMAMI_WEBSITE_ID = import.meta.env['VITE_UMAMI_WEBSITE_ID'] as
  | string
  | undefined;

let initialized = false;
let pending: Array<() => void> | null = [];

function enqueue(run: () => void) {
  if (!initialized) return;
  if (pending) {
    pending.push(run);
    return;
  }
  try {
    run();
  } catch {
    // analytics must never break the app
  }
}

function flush() {
  const queued = pending ?? [];
  pending = null;
  for (const run of queued) {
    try {
      run();
    } catch {
      // analytics must never break the app
    }
  }
}

export function initAnalytics() {
  if (!UMAMI_HOST || !UMAMI_WEBSITE_ID || !import.meta.env.PROD) return;
  if (typeof window === 'undefined' || initialized) return;

  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://${UMAMI_HOST}/script.js`;
  script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
  // We drive page views from the router ourselves.
  script.setAttribute('data-auto-track', 'false');
  // Respect the browser's "Do Not Track" setting.
  script.setAttribute('data-do-not-track', 'true');
  script.addEventListener('load', flush);
  script.addEventListener('error', () => {
    // Blocked or unreachable — drop the queue and stop collecting.
    pending = null;
    initialized = false;
  });
  document.head.appendChild(script);

  trackPageView(window.location.pathname + window.location.search);
}

export function trackPageView(url: string) {
  // Umami records the URL relative to the site root; strip the origin so
  // absolute hrefs from the router end up in the same shape.
  const path = url.replace(/^https?:\/\/[^/]+/, '') || '/';
  enqueue(() => window.umami?.track((props) => ({ ...props, url: path })));
}

export function trackEvent(category: string, action: string) {
  enqueue(() =>
    window.umami?.track(`${category}:${action}`, { category, action }),
  );
}
