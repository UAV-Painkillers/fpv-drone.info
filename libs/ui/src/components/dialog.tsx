import { Dialog as RadixDialog } from 'radix-ui';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  children?: ReactNode;
  /** Hide the close button for non-dismissable progress dialogs. */
  dismissable?: boolean;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  dismissable = true,
  className,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={dismissable ? onOpenChange : undefined}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={clsx(
            'fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
            'rounded-(--radius-card) border border-line bg-surface-raised p-6 shadow-xl data-[state=open]:animate-fade-in',
            className,
          )}
          onInteractOutside={dismissable ? undefined : (e) => e.preventDefault()}
          onEscapeKeyDown={dismissable ? undefined : (e) => e.preventDefault()}
        >
          <RadixDialog.Title className="mb-3 text-lg font-bold">
            {title}
          </RadixDialog.Title>
          {children}
          {dismissable ? (
            <RadixDialog.Close
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </RadixDialog.Close>
          ) : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
