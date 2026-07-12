import { createFileRoute } from '@tanstack/react-router';

// Real route so the prerenderer can emit a static /404.html (served by
// Vercel for any unknown path on the static deployment).
export const Route = createFileRoute('/404')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <main>
      <h1>404 — this raccoon found nothing here</h1>
      <a href="/">Back to start</a>
    </main>
  );
}
