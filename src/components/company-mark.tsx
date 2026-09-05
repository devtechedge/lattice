import { useState } from "react";
import { companyInitials, companyLogoSrc } from "@/lib/logo";

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
  const src = companyLogoSrc({ logoUrl, website });
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-sm font-medium text-bg"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.34,
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
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
