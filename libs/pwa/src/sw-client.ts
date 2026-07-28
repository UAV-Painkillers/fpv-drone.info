/**
 * Client side of the "service-worker" BroadcastChannel protocol.
 */

export interface DepsCacheStatus {
  cached: boolean;
  missing?: number;
  total?: number;
  error?: string;
}

export interface DepsProgress {
  cached: number;
  total: number;
}

type SWMessage = { type: string; payload?: unknown };

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  return new BroadcastChannel('service-worker');
}

export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;
  navigator.serviceWorker.register('/sw.js').catch((e) => {
    console.warn('Service worker registration failed', e);
  });
}

export async function isServiceWorkerActive(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  return !!registration?.active;
}

/** One-shot request/response over the broadcast channel. */
function request<T>(
  requestType: string,
  responseType: string,
  timeoutMs = 5000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const channel = getChannel();
    if (!channel) return reject(new Error('BroadcastChannel unavailable'));
    const timeout = setTimeout(() => {
      channel.close();
      reject(new Error(`Timed out waiting for ${responseType}`));
    }, timeoutMs);
    channel.addEventListener('message', (event) => {
      const message = event.data as SWMessage;
      if (message?.type !== responseType) return;
      clearTimeout(timeout);
      channel.close();
      resolve(message.payload as T);
    });
    channel.postMessage({ type: requestType });
  });
}

export function checkAnalyzerDepsCached(): Promise<DepsCacheStatus> {
  return request<DepsCacheStatus>(
    'PRECACHE_PID_ANALYZER_CHECK',
    'PRECACHE_PID_ANALYZER_CHECK_RESULT',
  );
}

export function downloadAnalyzerDeps(
  onProgress: (progress: DepsProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const channel = getChannel();
    if (!channel) return reject(new Error('BroadcastChannel unavailable'));
    channel.addEventListener('message', (event) => {
      const message = event.data as SWMessage;
      switch (message?.type) {
        case 'PRECACHE_PID_ANALYZER_PROGRESS':
          onProgress(message.payload as DepsProgress);
          break;
        case 'PRECACHE_PID_ANALYZER_COMPLETE':
          channel.close();
          resolve();
          break;
        case 'PRECACHE_PID_ANALYZER_ERROR':
          channel.close();
          reject(new Error(String((message.payload as { error?: string })?.error)));
          break;
      }
    });
    channel.postMessage({ type: 'PRECACHE_PID_ANALYZER_START' });
  });
}

export function clearAllCaches(): Promise<unknown> {
  return request('CLEAR_CACHES', 'CACHES_CLEARED', 10_000);
}
