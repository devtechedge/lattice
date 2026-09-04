export function LatticeMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3" y="3" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="19" y="3" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="19" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="19" y="19" width="10" height="10" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      <path d="M13 8h6M8 13v6M24 13v6M13 24h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
