import { useT } from '@fpv/i18n';
import { Button } from '@fpv/ui';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'fpv-install-dismissed';

/** Small install hint shown when the browser offers PWA installation. */
export function InstallBanner() {
  const t = useT();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      /* private mode */
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!promptEvent) return null;

  const dismiss = () => {
    setPromptEvent(null);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="mb-4 flex items-center gap-3 rounded-(--radius-control) border border-brand-green/40 bg-brand-green-soft px-4 py-2.5 text-sm">
      <span className="min-w-0 flex-1">{t.pwa.installBanner}</span>
      <Button
        size="sm"
        onClick={() => {
          void promptEvent.prompt();
          dismiss();
        }}
      >
        {t.pwa.installButton}
      </Button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="cursor-pointer text-ink-muted hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
