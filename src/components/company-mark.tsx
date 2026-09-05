import { useMemo, useState } from "react";
import { companyInitials, companyLogoFallbackSrc, companyLogoSrc } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  website,
  logoUrl,
  hue = 140,
  size = 32,
}: {
  name: string;
  website?: string | null;
  logoUrl?: string | null;
  hue?: number;
  size?: number;
}) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    const primary = companyLogoSrc({ logoUrl, website });
    const secondary = companyLogoFallbackSrc(website);
    if (primary) list.push(primary);
    if (secondary && secondary !== primary) list.push(secondary);
    return list;
  }, [logoUrl, website]);

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = candidates[index] ?? null;

  const initials = (
    <span
      className="grid shrink-0 place-items-center rounded-sm font-medium text-bg"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.34),
        background: `hsl(${hue} 28% 46%)`,
      }}
      aria-hidden
    >
      {companyInitials(name).slice(0, 2)}
    </span>
  );

  if (!src) return initials;

  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-sm" aria-hidden>
        {initials}
      </span>
      <img
        key={src}
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn(
          "relative z-[1] rounded-sm bg-raised object-contain",
          loaded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIndex((i) => i + 1);
        }}
      />
    </span>
  );
}
