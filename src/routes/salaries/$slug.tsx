import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ROLE_KEYS } from "@/lib/catalog/salary";
import { REGIONS } from "@/lib/catalog/salary";

export const Route = createFileRoute("/salaries/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  if (ROLE_KEYS.includes(slug as never) || REGIONS.map((r) => r.toLowerCase().replace(/ /g, "-")).includes(slug)) {
    return <Navigate to="/salaries" />;
  }
  return <Navigate to="/salaries" />;
}
