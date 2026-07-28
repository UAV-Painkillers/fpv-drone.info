import { useState } from 'react';
import { Dialog } from './dialog';

export interface ExpandableImageProps {
  src: string;
  alt?: string;
  caption?: string;
}

/** Image that opens full-size in a dialog when tapped (guide screenshots). */
export function ExpandableImage({ src, alt = '', caption }: ExpandableImageProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <figure className="my-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in overflow-hidden rounded-(--radius-control) border border-line"
        >
          <img src={src} alt={alt} loading="lazy" className="w-full" />
        </button>
        {caption ? (
          <figcaption className="mt-1 text-center text-xs text-ink-muted">
            {caption}
          </figcaption>
        ) : null}
      </figure>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={caption ?? alt}
        className="max-w-4xl"
      >
        <img src={src} alt={alt} className="w-full rounded-(--radius-control)" />
      </Dialog>
    </>
  );
}
