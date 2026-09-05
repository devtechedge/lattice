import { createFileRoute } from "@tanstack/react-router";
import { COMPANIES } from "@/lib/catalog/data";
import { SITE_ORIGIN } from "@/lib/seo";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = [
          "",
          "/roles",
          "/gigs",
          "/talent",
          "/salaries",
          "/companies",
          "/learn",
          "/about",
          "/post",
          "/login",
          "/privacy",
          "/terms",
          "/search",
          "/pulse",
          ...COMPANIES.map((c) => `/companies/${c.slug}`),
        ];
        const body =
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
          "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
          urls
            .map((path) => `  <url><loc>${xmlEscape(SITE_ORIGIN)}${xmlEscape(path)}</loc></url>`)
            .join("\n") +
          "\n</urlset>";
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
