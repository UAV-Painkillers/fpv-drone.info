import type { ReactNode } from 'react';
import { MascotImage } from './mascots';

/** Processing raccoon shown while the analyzer crunches a log. */
export function LoaderRaccoon({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <MascotImage
        name="processing"
        alt="Raccoon busy processing"
        className="w-40 max-w-full rounded-(--radius-card)"
      />
      {children ? <div className="text-sm text-ink-muted">{children}</div> : null}
    </div>
  );
}

/** Fire raccoon for errors and the 404 page. */
export function ErrorRaccoon({
  title,
  children,
}: {
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-(--radius-card) border border-danger/40 bg-danger/5 p-6 text-center"
    >
      <MascotImage
        name="fireError"
        alt="Raccoon setting things on fire"
        className="w-40 max-w-full rounded-(--radius-card)"
      />
      {title ? <p className="text-lg font-bold text-danger">{title}</p> : null}
      {children ? <div className="text-sm text-ink-muted">{children}</div> : null}
    </div>
  );
}
