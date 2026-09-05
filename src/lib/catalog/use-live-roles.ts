import { useEffect, useState } from "react";
import { listLiveRoles } from "@/lib/server/live";
import type { Role } from "./types";

let clientInflight: Promise<Role[]> | undefined;
let clientCache: { at: number; value: Role[] } | undefined;
const CLIENT_TTL_MS = 60_000;

function loadClientLiveRoles(): Promise<Role[]> {
  const now = Date.now();
  if (clientCache && now - clientCache.at < CLIENT_TTL_MS) {
    return Promise.resolve(clientCache.value);
  }
  if (clientInflight) return clientInflight;
  clientInflight = listLiveRoles()
    .then((rows) => {
      clientCache = { at: Date.now(), value: rows };
      return rows;
    })
    .finally(() => {
      clientInflight = undefined;
    });
  return clientInflight;
}

export function useLiveRoles(initial?: Role[]) {
  const seeded = initial?.length ? initial : clientCache?.value;
  const [live, setLive] = useState<Role[]>(seeded ?? []);
  const [ready, setReady] = useState(!!seeded);
  useEffect(() => {
    let on = true;
    loadClientLiveRoles()
      .then((rows) => {
        if (on) setLive(rows);
      })
      .catch(() => {
        if (on && !seeded) setLive([]);
      })
      .finally(() => {
        if (on) setReady(true);
      });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per mount
  }, []);
  return { live, ready };
}
