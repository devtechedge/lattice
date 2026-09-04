import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/apply/$jobSlug")({ component: Page });

function Page() {
  const { jobSlug } = Route.useParams();
  return <Navigate to="/roles/$slug" params={{ slug: jobSlug }} />;
}
