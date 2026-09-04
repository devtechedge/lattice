export function CompanyMark({ name, hue, size = 32 }: { name: string; hue: number; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
      {initials}
    </span>
  );
}
