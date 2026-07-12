import { ErrorRaccoon } from '@fpv/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

// Real route so the prerenderer can emit a static /404.html (served by
// Vercel for any unknown path on the static deployment).
export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6">
      <ErrorRaccoon title="404">
        <p>This page does not exist (anymore).</p>
        <Link to="/" className="mt-2 inline-block font-semibold text-gradient">
          fpv-drone.info
        </Link>
      </ErrorRaccoon>
    </main>
  );
}
