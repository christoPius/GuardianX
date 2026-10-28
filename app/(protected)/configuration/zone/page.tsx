"use client";

import { useEffect, useState } from "react";
import type { CameraSource, NormalizedPoint, ZoneConfiguration } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfigTabs } from "@/components/configuration/ConfigTabs";
import { SourceSelector } from "@/components/configuration/SourceSelector";
import { PointEditor } from "@/components/configuration/PointEditor";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from "@/components/ui/States";

const MIN_POINTS = 3;

export default function ZoneConfigPage() {
  const [sources, setSources] = useState<CameraSource[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [zone, setZone] = useState<ZoneConfiguration | null>(null);
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
    setZone(null);
    setSaveMessage(null);
    getApiClient()
      .getZoneConfiguration(selectedId)
      .then((res) => {
        if (res.ok) setZone(res.data);
        else setError(res.error);
      });
  }, [selectedId]);

  const handlePointsChange = (points: NormalizedPoint[]) => {
    if (!zone) return;
    setZone({ ...zone, points });
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!zone) return;
    setSaving(true);
    setSaveMessage(null);
    const res = await getApiClient().saveZoneConfiguration(zone);
    setSaving(false);
    if (res.ok) {
      setZone(res.data);
      setSaveMessage("Zone saved.");
    } else {
      setSaveMessage(res.error);
    }
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
            <CardHeader
              title="Restricted Zone"
              description="Click on the frame to draw the polygon boundary an entry into this area should trigger."
            />

            {!zone ? (
              <LoadingState label="Loading zone" />
            ) : (
              <>
                <PointEditor
                  mode="polygon"
                  points={zone.points}
                  onChange={handlePointsChange}
                  minPoints={MIN_POINTS}
                  accentColor="var(--color-signal-medium)"
                  accentDim="var(--color-signal-medium-dim)"
                />

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-hairline">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving || (zone.points.length > 0 && zone.points.length < MIN_POINTS)}
                  >
                    {saving ? "Saving…" : "Save zone"}
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
