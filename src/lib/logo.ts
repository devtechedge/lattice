function isPrivateHost(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "::1") {
    return true;
  }
  if (h.includes(":")) {
    if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  }
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31) ||
      a === 100
    ) {
      return true;
    }
  }
  return false;
}

function publicHttpsUrl(value: string, max = 500): string | null {
  if (!value || value.length > max) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (isPrivateHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!host || isPrivateHost(host)) return null;
    return host;
  } catch {
    return null;
  }
}

/** Company site icon via Google's public favicon endpoint. Initials if it fails. */
export function companyLogoSrc(opts: {
  logoUrl?: string | null;
  website?: string | null;
}): string | null {
  if (opts.logoUrl && publicHttpsUrl(opts.logoUrl)) return opts.logoUrl;
  const host = hostFromUrl(opts.website);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

export function companyLogoFallbackSrc(website?: string | null): string | null {
  const host = hostFromUrl(website);
  if (!host) return null;
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`;
}

export function companyInitials(name: string): string {
  const parts = name
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
