import { track } from "@vercel/analytics";

// extend window element for matomo
declare global {
    interface Window {
        Matomo?: any;
    }
}

export function trackEvent(category: string, action: string, eventName?: string, numericValue?: number) {
    trackMatomoEvent(category, action, eventName, numericValue);
    trackVercelEvent(category, action, eventName, numericValue);
}

function trackVercelEvent(category: string, action: string, eventName?: string, numericValue?: number) {
    track(`${category}:${action}`, {
        eventName,
        numericValue,
    } as Record<string, any>);
}

function trackMatomoEvent(category: string, action: string, eventName?: string, numericValue?: number) {
    if (!window.Matomo) {
        return;
    }

    const tracker = window.Matomo.getTracker();

    tracker.trackEvent(category, action, eventName, numericValue);
}