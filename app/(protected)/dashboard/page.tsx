"use client";

import { useEffect, useState } from "react";
import type { CameraSource, MonitoringStatus } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { LiveViewPanel } from "@/components/dashboard/LiveViewPanel";
import { CompactMonitoringStatus } from "@/components/dashboard/CompactStatus";
import { CameraOverview } from "@/components/dashboard/CameraOverview";
import { LoadingState, ErrorState, DisconnectedBanner } from "@/components/ui/States";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | {
      phase: "ready";
      status: MonitoringStatus;
      sources: CameraSource[];
    };

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [viewSourceId, setViewSourceId] = useState<string | null>(null);

  const load = () => {
    setState({ phase: "loading" });
    const client = getApiClient();
    Promise.all([client.getMonitoringStatus(), client.getSources()])
      .then(([statusRes, sourcesRes]) => {
        if (!statusRes.ok) {
          setState({ phase: "error", message: statusRes.error });
          return;
        }
        if (!sourcesRes.ok) {
          setState({ phase: "error", message: sourcesRes.error });
          return;
        }
        setState({
          phase: "ready",
          status: statusRes.data,
          sources: sourcesRes.data,
        });
        setViewSourceId(statusRes.data.activeSourceId);
      })
      .catch(() => setState({ phase: "error", message: "Unexpected error loading the dashboard." }));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  return (
    <>
      <PageHeader title="Dashboard" />

      {state.phase === "loading" && <LoadingState label="Loading dashboard" />}

      {state.phase === "error" && (
        <ErrorState
          title="Couldn't load the dashboard"
          description={state.message}
          onRetry={load}
        />
      )}

      {state.phase === "ready" && (
        <div className="flex flex-col gap-4">
          {!state.status.backendReachable && <DisconnectedBanner onRetry={load} />}

          <CompactMonitoringStatus
            status={state.status}
            activeSource={state.sources.find((s) => s.id === state.status.activeSourceId) ?? null}
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <LiveViewPanel
                source={state.sources.find((s) => s.id === viewSourceId) ?? null}
              />
            </div>
            <div className="lg:col-span-2">
              <CameraOverview
                sources={state.sources}
                activeSourceId={viewSourceId}
                onSelectSource={(source) => setViewSourceId(source.id)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
