import { useMemo, useState } from "react";
import { companyInitials, companyLogoFallbackSrc, companyLogoSrc } from "@/lib/logo";

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
  const primary = useMemo(() => companyLogoSrc({ logoUrl, website }), [logoUrl, website]);
  const fallback = useMemo(() => companyLogoFallbackSrc(website), [website]);
  const [src, setSrc] = useState<string | null>(primary);
  const [failed, setFailed] = useState(!primary);

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

  if (failed || !src) return initials;

  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      {/* Initials sit underneath so a blocked/broken icon never leaves an empty hole */}
      <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-sm" aria-hidden>
        {initials}
      </span>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="relative z-[1] rounded-sm bg-raised object-contain"
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (src === primary && fallback && fallback !== primary) {
            setSrc(fallback);
            return;
          }
          setFailed(true);
        }}
      />
    </span>
  );
}
