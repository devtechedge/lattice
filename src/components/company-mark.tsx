import { useEffect, useMemo, useState } from "react";
import { companyInitials } from "@/lib/logo";

export function CompanyMark({
  name,
  logoUrl,
  hue = 140,
  size = 32,
}: {
  name: string;
  /** Same-origin path like `/logos/coinbase.png`. */
  logoUrl?: string | null;
  website?: string | null;
  hue?: number;
  size?: number;
}) {
  const src = useMemo(() => (logoUrl && logoUrl.trim() ? logoUrl.trim() : null), [logoUrl]);
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
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
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-sm bg-raised object-contain"
      style={{ width: size, height: size }}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
