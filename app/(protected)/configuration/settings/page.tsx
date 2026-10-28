"use client";

import { useEffect, useState } from "react";
import type { CameraSource, MonitoringSettings } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfigTabs } from "@/components/configuration/ConfigTabs";
import { SourceSelector } from "@/components/configuration/SourceSelector";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from "@/components/ui/States";

const inputClasses =
  "w-full bg-panel-raised border border-hairline-strong rounded-[3px] px-3 py-2 text-sm text-ink focus:border-signal-info font-data";

export default function SettingsConfigPage() {
  const [sources, setSources] = useState<CameraSource[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [settings, setSettings] = useState<MonitoringSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    getApiClient()
      .getSources()
      .then((res) => {
        if (!res.ok) {
          setError(res.error);
          return;
        }
        setSources(res.data);
        setSelectedId((prev) => prev || res.data[0]?.id || "");
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(null);
    setSaveMessage(null);
    getApiClient()
      .getMonitoringSettings(selectedId)
      .then((res) => {
        if (res.ok) setSettings(res.data);
        else setError(res.error);
      });
  }, [selectedId]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveMessage(null);
    const res = await getApiClient().saveMonitoringSettings(settings);
    setSaving(false);
    setSaveMessage(res.ok ? "Settings saved." : res.error);
  };

  if (error) {
    return (
      <>
        <PageHeader title="Configuration" />
        <ConfigTabs />
        <ErrorState title="Couldn't load configuration" description={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Configuration" description="Manage sources, zones, boundaries, and monitoring settings." />
      <ConfigTabs />

      {!sources ? (
        <LoadingState label="Loading sources" />
      ) : (
        <div className="flex flex-col gap-5">
          <SourceSelector sources={sources} selectedId={selectedId} onChange={setSelectedId} />

          <Card>
            <CardHeader title="Monitoring Settings" description="Applies to this source only." />

            {!settings ? (
              <LoadingState label="Loading settings" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Monitoring start time">
                    <input
                      type="time"
                      className={inputClasses}
                      value={settings.monitoringStartTime}
                      onChange={(e) => setSettings({ ...settings, monitoringStartTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Monitoring end time">
                    <input
                      type="time"
                      className={inputClasses}
                      value={settings.monitoringEndTime}
                      onChange={(e) => setSettings({ ...settings, monitoringEndTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Loitering duration (seconds)" hint="How long someone must stay before it counts as loitering.">
                    <input
                      type="number"
                      min={0}
                      className={inputClasses}
                      value={settings.loiteringDurationSeconds}
                      onChange={(e) =>
                        setSettings({ ...settings, loiteringDurationSeconds: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Confidence threshold" hint="0–1. Detections below this confidence are ignored.">
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      className={inputClasses}
                      value={settings.confidenceThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, confidenceThreshold: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Alert cutoff score" hint="Incidents scoring below this are logged but don't send an alert.">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputClasses}
                      value={settings.alertCutoffScore}
                      onChange={(e) => setSettings({ ...settings, alertCutoffScore: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-hairline">
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save settings"}
                  </Button>
                  {saveMessage && <span className="text-sm text-ink-muted">{saveMessage}</span>}
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-data text-ink-muted uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
