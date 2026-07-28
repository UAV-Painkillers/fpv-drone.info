import { useSyncExternalStore, type ReactNode } from 'react';

const emptySubscribe = () => () => undefined;

/**
 * Renders children only after hydration. Used around browser-only widgets
 * (ECharts, the Pyodide analyzer) so prerendered HTML stays stable.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  return hydrated ? children : fallback;
}
