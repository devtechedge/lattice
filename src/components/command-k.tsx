import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { useEffect } from "react";
import { COMPANIES, LEARN, ROLES, TALENT } from "@/lib/catalog/data";

export function CommandK({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-bg/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <Command
        className="mx-auto w-full max-w-xl overflow-hidden rounded-md border border-line bg-raised shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Search roles, companies, talent, learn…"
          className="h-12 w-full border-b border-line bg-transparent px-4 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-auto p-2">
          <Command.Empty className="px-3 py-6 text-sm text-mute">No matches.</Command.Empty>
          <Command.Group heading="Roles" className="text-[11px] uppercase tracking-wider text-mute">
            {ROLES.slice(0, 8).map((r) => (
              <Command.Item key={r.id} onSelect={() => go(`/roles/${r.slug}`)} className="cursor-pointer rounded-sm px-3 py-2 text-sm data-[selected=true]:bg-inset">
                {r.title}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Companies" className="mt-2 text-[11px] uppercase tracking-wider text-mute">
            {COMPANIES.slice(0, 6).map((c) => (
              <Command.Item key={c.id} onSelect={() => go(`/companies/${c.slug}`)} className="cursor-pointer rounded-sm px-3 py-2 text-sm data-[selected=true]:bg-inset">
                {c.name}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Talent" className="mt-2 text-[11px] uppercase tracking-wider text-mute">
            {TALENT.filter((t) => t.privacy === "public").slice(0, 6).map((t) => (
              <Command.Item key={t.id} onSelect={() => go(`/talent/${t.slug}`)} className="cursor-pointer rounded-sm px-3 py-2 text-sm data-[selected=true]:bg-inset">
                {t.displayName}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Learn" className="mt-2 text-[11px] uppercase tracking-wider text-mute">
            {LEARN.map((a) => (
              <Command.Item key={a.slug} onSelect={() => go(`/learn/${a.slug}`)} className="cursor-pointer rounded-sm px-3 py-2 text-sm data-[selected=true]:bg-inset">
                {a.title}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
