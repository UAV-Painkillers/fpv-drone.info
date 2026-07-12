import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/')({
  component: Home,
});

function Home() {
  const { locale } = Route.useParams();
  return (
    <main>
      <h1>Welcome ({locale})</h1>
      <p>The FPV drone tuning toolbox is being rebuilt here.</p>
    </main>
  );
}
