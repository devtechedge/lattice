import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "signal" | "gold" | "cyan" | "mute";
}) {
  const tones = {
    default: "border-line text-mute",
    signal: "border-signal/40 text-signal",
    gold: "border-gold/40 text-gold",
    cyan: "border-cyan/40 text-cyan",
    mute: "border-line text-mute",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
