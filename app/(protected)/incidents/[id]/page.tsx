"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { Incident, OwnerFeedback } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { SeverityBadge } from "@/components/ui/Badge";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { ScoreBreakdown } from "@/components/incidents/ScoreBreakdown";
import { EvidenceViewer } from "@/components/incidents/EvidenceViewer";
import { FeedbackControls } from "@/components/incidents/FeedbackControls";
import { EVENT_TYPE_LABEL } from "@/lib/utils/severity";
import { formatDuration, formatTimestamp } from "@/lib/utils/format";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; incident: Incident };

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  const load = () => {
    setState({ phase: "loading" });
    getApiClient()
      .getIncident(id)
      .then((res) => {
        if (!res.ok) {
          setState({ phase: "error", message: res.error });
          return;
        }
        setState({ phase: "ready", incident: res.data });
      })
      .catch(() => setState({ phase: "error", message: "Unexpected error loading this incident." }));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [id]);

  const handleFeedback = async (feedback: OwnerFeedback) => {
    const res = await getApiClient().submitFeedback(id, feedback);
    if (!res.ok) throw new Error(res.error);
    setState({ phase: "ready", incident: res.data });
  };

  return (
    <>
      <Link
        href="/incidents"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4"
      >
        <span aria-hidden="true">←</span> Back to incidents
      </Link>

      {state.phase === "loading" && <LoadingState label="Loading incident" />}

      {state.phase === "error" && (
        <ErrorState title="Couldn't load this incident" description={state.message} onRetry={load} />
      )}

      {state.phase === "ready" && (
        <>
          <PageHeader
            title={EVENT_TYPE_LABEL[state.incident.eventType]}
            description={`${state.incident.sourceName} · Track #${state.incident.trackId}`}
            action={<SeverityBadge severity={state.incident.severity} />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <DetailStat label="Started" value={formatTimestamp(state.incident.startedAt)} />
            <DetailStat
              label="Duration"
              value={formatDuration(state.incident.startedAt, state.incident.endedAt)}
            />
            <DetailStat label="Source" value={state.incident.sourceName} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <ScoreBreakdown
                score={state.incident.score}
                severity={state.incident.severity}
                factors={state.incident.evidenceFactors}
                explanation={state.incident.explanation}
              />
              <FeedbackControls feedback={state.incident.feedback} onSubmit={handleFeedback} />
            </div>
            <EvidenceViewer evidence={state.incident.evidence} />
          </div>
        </>
      )}
    </>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-hairline rounded-[4px] bg-panel px-4 py-3">
      <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
