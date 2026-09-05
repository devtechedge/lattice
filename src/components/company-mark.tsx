import { useMemo, useState } from "react";
import { companyInitials } from "@/lib/logo";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  logoUrl,
  hue = 140,
  size = 32,
}: {
  name: string;
  /** Same-origin path like `/logos/coinbase.png`, or any https URL. */
  logoUrl?: string | null;
  website?: string | null; // kept for call-site compat; unused
  hue?: number;
  size?: number;
}) {
  const src = useMemo(() => (logoUrl && logoUrl.trim() ? logoUrl.trim() : null), [logoUrl]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);

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
      <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-sm" aria-hidden>
        {initials}
      </span>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn(
          "relative z-[1] rounded-sm bg-paper object-contain",
          loaded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setFailed(true);
        }}
      />
    </span>
  );
}
