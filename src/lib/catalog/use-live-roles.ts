import { useEffect, useState } from "react";
import { listLiveRoles } from "@/lib/server/live";
import type { Role } from "./types";

export function useLiveRoles() {
  const [live, setLive] = useState<Role[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let on = true;
    listLiveRoles()
      .then((rows) => {
        if (on) setLive(rows);
      })
      .catch(() => {
        if (on) setLive([]);
      })
      .finally(() => {
        if (on) setReady(true);
      });
    return () => {
      on = false;
    };
  }, []);
  return { live, ready };
}
