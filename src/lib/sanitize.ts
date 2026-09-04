/** Allow http(s) and same-origin paths. Drop javascript:, data:, and protocol-relative URLs. */
export function safeHref(href: string): string | null {
  const t = href.trim();
  if (!t) return null;
  if (t.startsWith("/") && !t.startsWith("//") && !t.includes("\\")) {
    if (t.includes(":")) return null;
    return t;
  }
  try {
    const u = new URL(t);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* invalid */
  }
  return null;
}

export function safeHttpsUrl(href: string): string | null {
  const u = safeHref(href);
  return u && u.startsWith("https:") ? u : null;
}
