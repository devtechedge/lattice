import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAlert, listMyAlerts } from "@/lib/server/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useLiveRoles } from "@/lib/catalog/use-live-roles";

export const Route = createFileRoute("/alerts")({ component: Page });

function Page() {
  const user = useCurrentUser();
  const [cadence, setCadence] = useState("weekly");
  const [channel, setChannel] = useState("email");
  const [items, setItems] = useState<{ id: string; channel: string; cadence: string }[]>([]);
  const { live } = useLiveRoles();
  useEffect(() => {
    if (!user) return;
    listMyAlerts().then(setItems).catch(() => {});
  }, [user]);

  const amp = String.fromCharCode(38);
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Lattice roles</title>${live.slice(0, 20).map((r) => `<item><title>${escapeXml(r.title, amp)}</title><link>/roles/${r.slug}</link></item>`).join("")}</channel></rss>`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight">Alerts</h1>
      <p className="mt-2 text-sm text-mute">Email, Telegram, Discord, and RSS. Telegram and Discord are simulated subscribe confirmations in this free tier — no real bots.</p>
      <form
        className="mt-6 space-y-3 rounded-md border border-line bg-raised p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user) {
            window.location.href = "/login";
            return;
          }
          await createAlert({ data: { channel, cadence, filter: { sort: "newest" } } });
          toast.success(channel === "telegram" || channel === "discord" ? `Subscribed to Lattice ${channel} (demo).` : "Alert saved.");
          listMyAlerts().then(setItems).catch(() => {});
        }}
      >
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="email">Email</option>
          <option value="telegram">Telegram</option>
          <option value="discord">Discord</option>
          <option value="rss">RSS snapshot</option>
        </select>
        <select value={cadence} onChange={(e) => setCadence(e.target.value)} className="h-10 w-full rounded-sm border border-line bg-raised px-3 text-sm">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <Button type="submit">Subscribe</Button>
      </form>
      <ul className="mt-6 text-sm text-mute">
        {items.map((i) => <li key={i.id}>{i.channel} · {i.cadence}</li>)}
      </ul>
      <h2 className="mt-10 text-sm font-medium">RSS (current board)</h2>
      <pre className="mt-2 overflow-auto rounded-md border border-line bg-inset p-3 text-[11px] text-mute">{rss}</pre>
    </main>
  );
}

function escapeXml(s: string, amp: string) {
  return s.replace(/&/g, amp + "amp;").replace(/</g, amp + "lt;").replace(/>/g, amp + "gt;");
}
