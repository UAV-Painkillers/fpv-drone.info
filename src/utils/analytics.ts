import { track } from "@vercel/analytics";

// extend window element for matomo
declare global {
    interface Window {
        Matomo?: any;
    }
}

export function trackEvent(category: string, action: string) {
    trackMatomoEvent(category, action);
    trackVercelEvent(category, action);
}

function trackVercelEvent(category: string, action: string) {
    track(`${category}:${action}`, {
        eventName,
        numericValue,
    } as Record<string, any>);
}

function trackMatomoEvent(category: string, action: string) {
    if (!window.Matomo) {
        return;
    }

    const tracker = window.Matomo.getTracker();

    tracker.trackEvent(category, action, `${category}:${action}`);
}