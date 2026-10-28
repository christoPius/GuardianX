"use client";

import { useEffect, useState } from "react";
import type { EventType, Incident, Severity } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; incidents: Incident[] };

export default function IncidentsPage() {
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [eventType, setEventType] = useState<EventType | "all">("all");
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  const load = () => {
    setState({ phase: "loading" });
    getApiClient()
      .getIncidents({
        severity: severity === "all" ? undefined : severity,
        eventType: eventType === "all" ? undefined : eventType,
      })
      .then((res) => {
        if (!res.ok) {
          setState({ phase: "error", message: res.error });
          return;
        }
        setState({ phase: "ready", incidents: res.data });
      })
      .catch(() => setState({ phase: "error", message: "Unexpected error loading incidents." }));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [severity, eventType]);

  const hasActiveFilters = severity !== "all" || eventType !== "all";

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Every detected event across all sources, with severity, score, and review status."
      />

      <div className="mb-5">
        <IncidentFilters
          severity={severity}
          eventType={eventType}
          onSeverityChange={setSeverity}
          onEventTypeChange={setEventType}
        />
      </div>

      {state.phase === "loading" && <LoadingState label="Loading incidents" />}

      {state.phase === "error" && (
        <ErrorState title="Couldn't load incidents" description={state.message} onRetry={load} />
      )}

      {state.phase === "ready" && state.incidents.length === 0 && (
        <EmptyState
          title={hasActiveFilters ? "No incidents match these filters" : "No incidents recorded"}
          description={
            hasActiveFilters
              ? "Try a different severity or event type."
              : "Detected events will appear here once monitoring picks something up."
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={() => {
                  setSeverity("all");
                  setEventType("all");
                }}
                className="text-sm text-signal-info hover:underline underline-offset-2"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      )}

      {state.phase === "ready" && state.incidents.length > 0 && (
        <IncidentTable incidents={state.incidents} />
      )}
    </>
  );
}
