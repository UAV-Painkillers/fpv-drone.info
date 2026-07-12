import { format, useT } from '@fpv/i18n';
import { Button, ProgressBar } from '@fpv/ui';
import { useEffect, useState } from 'react';
import {
  checkAnalyzerDepsCached,
  clearAllCaches,
  downloadAnalyzerDeps,
  isServiceWorkerActive,
  type DepsProgress,
} from './sw-client';

type Status =
  | { kind: 'unavailable' }
  | { kind: 'checking' }
  | { kind: 'not-cached' }
  | { kind: 'downloading'; progress: DepsProgress }
  | { kind: 'cached' }
  | { kind: 'error'; message: string };

/**
 * Opt-in offline download of the analyzer runtime + cache reset. Shown on
 * the analyzer page; unlike the old sw-caching-blocker it never blocks
 * online use.
 */
export function OfflineDownloadCard() {
  const t = useT();
  const [status, setStatus] = useState<Status>({ kind: 'checking' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await isServiceWorkerActive())) {
        if (!cancelled) setStatus({ kind: 'unavailable' });
        return;
      }
      try {
        const result = await checkAnalyzerDepsCached();
        if (!cancelled) {
          setStatus(result.cached ? { kind: 'cached' } : { kind: 'not-cached' });
        }
      } catch {
        if (!cancelled) setStatus({ kind: 'unavailable' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.kind === 'unavailable' || status.kind === 'checking') {
    return null;
  }

  const download = async () => {
    setStatus({ kind: 'downloading', progress: { cached: 0, total: 1 } });
    try {
      await downloadAnalyzerDeps((progress) =>
        setStatus({ kind: 'downloading', progress }),
      );
      setStatus({ kind: 'cached' });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message });
    }
  };

  const clear = async () => {
    try {
      await clearAllCaches();
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-(--radius-control) border border-line bg-surface-sunken px-4 py-3 text-sm">
      {status.kind === 'cached' && (
        <span className="font-semibold text-success">✓ {t.cache.offlineReady}</span>
      )}
      {status.kind === 'not-cached' && (
        <Button variant="secondary" size="sm" onClick={() => void download()}>
          ⬇ {t.cache.downloadForOffline}
        </Button>
      )}
      {status.kind === 'downloading' && (
        <span className="flex min-w-56 items-center gap-3">
          <ProgressBar
            value={
              status.progress.total > 0
                ? status.progress.cached / status.progress.total
                : undefined
            }
            className="flex-1"
          />
          <span className="text-xs whitespace-nowrap text-ink-muted">
            {format(t.cache.downloading, {
              percent: Math.round(
                (status.progress.cached / Math.max(1, status.progress.total)) * 100,
              ),
            })}
          </span>
        </span>
      )}
      {status.kind === 'error' && (
        <span className="text-danger">{status.message}</span>
      )}
      <button
        type="button"
        onClick={() => void clear()}
        className="ml-auto cursor-pointer text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
      >
        {t.cache.clearAndReload}
      </button>
    </div>
  );
}
