"use client";

import { useEffect, useState } from "react";
import type { CameraSource } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfigTabs } from "@/components/configuration/ConfigTabs";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { formatRelativeTime } from "@/lib/utils/format";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; sources: CameraSource[] };

export default function SourceConfigPage() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [testResults, setTestResults] = useState<Record<string, { status: "ok" | "failed"; message: string }>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    setState({ phase: "loading" });
    getApiClient()
      .getSources()
      .then((res) => {
        if (!res.ok) {
          setState({ phase: "error", message: res.error });
          return;
        }
        setState({ phase: "ready", sources: res.data });
      })
      .catch(() => setState({ phase: "error", message: "Unexpected error loading sources." }));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  const handleTest = async (sourceId: string) => {
    setTesting(sourceId);
    const res = await getApiClient().testSourceConnection(sourceId);
    if (res.ok) setTestResults((prev) => ({ ...prev, [sourceId]: res.data }));
    setTesting(null);
  };

  const handleSaveName = async (source: CameraSource) => {
    const newName = editing[source.id]?.trim();
    if (!newName || newName === source.displayName) return;
    setSaving(source.id);
    const res = await getApiClient().saveSource({ ...source, displayName: newName });
    if (res.ok && state.phase === "ready") {
      setState({
        phase: "ready",
        sources: state.sources.map((s) => (s.id === source.id ? res.data : s)),
      });
    }
    setSaving(null);
  };

  return (
    <>
      <PageHeader title="Configuration" description="Manage sources, zones, boundaries, and monitoring settings." />
      <ConfigTabs />

      {state.phase === "loading" && <LoadingState label="Loading sources" />}
      {state.phase === "error" && (
        <ErrorState title="Couldn't load sources" description={state.message} onRetry={load} />
      )}

      {state.phase === "ready" && (
        <div className="flex flex-col gap-4">
          {state.sources.map((source) => (
            <Card key={source.id}>
              <CardHeader
                title={source.displayName}
                description={source.connectionLabel}
                action={
                  <span
                    className={`text-xs font-data px-2 py-0.5 rounded-[3px] ${
                      source.status === "online"
                        ? "text-signal-low bg-signal-low-dim"
                        : "text-ink-faint bg-panel-raised"
                    }`}
                  >
                    {source.status}
                  </span>
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-1">Type</p>
                  <p className="text-ink uppercase font-data">{source.sourceType}</p>
                </div>
                <div>
                  <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-1">Last seen</p>
                  <p className="text-ink">{formatRelativeTime(source.lastSeenAt)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor={`name-${source.id}`} className="text-xs font-data text-ink-muted uppercase tracking-wide">
                  Display name
                </label>
                <div className="flex gap-2">
                  <input
                    id={`name-${source.id}`}
                    defaultValue={source.displayName}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [source.id]: e.target.value }))}
                    className="flex-1 bg-panel-raised border border-hairline-strong rounded-[3px] px-3 py-2 text-sm text-ink focus:border-signal-info"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleSaveName(source)}
                    disabled={saving === source.id}
                  >
                    {saving === source.id ? "Saving…" : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-ink-faint">
                  Connection credentials are managed on the device and never shown here.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => handleTest(source.id)} disabled={testing === source.id}>
                  {testing === source.id ? "Testing…" : "Test connection"}
                </Button>
                {testResults[source.id] && (
                  <span
                    className={`text-sm ${
                      testResults[source.id].status === "ok" ? "text-signal-low" : "text-signal-high"
                    }`}
                  >
                    {testResults[source.id].message}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
