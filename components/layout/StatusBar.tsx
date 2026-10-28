"use client";

import { useEffect, useState } from "react";
import type { MonitoringStatus } from "@/types";
import { getApiClient, usingMockBackend } from "@/lib/api";

export function StatusBar() {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getApiClient()
      .getMonitoringStatus()
      .then((res) => {
        if (!cancelled && res.ok) setStatus(res.data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-2.5 border-b border-hairline bg-ground/80 text-xs font-data text-ink-muted">
      <div className="flex items-center gap-2">
        {status === null ? (
          <span>Checking monitoring status…</span>
        ) : status.isRunning ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-signal-low animate-pulse-dot" aria-hidden="true" />
            <span className="text-ink">Monitoring active</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" aria-hidden="true" />
            <span>Monitoring paused</span>
          </>
        )}
      </div>
      {usingMockBackend && (
        <span className="px-2 py-0.5 rounded-[3px] bg-signal-medium-dim text-signal-medium">
          Demo data · not connected to FastAPI
        </span>
      )}
    </div>
  );
}
