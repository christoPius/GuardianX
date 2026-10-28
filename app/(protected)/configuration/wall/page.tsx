"use client";

import { useEffect, useState } from "react";
import type { CameraSource, NormalizedPoint, WallConfiguration } from "@/types";
import { getApiClient } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfigTabs } from "@/components/configuration/ConfigTabs";
import { SourceSelector } from "@/components/configuration/SourceSelector";
import { PointEditor } from "@/components/configuration/PointEditor";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from "@/components/ui/States";

const MIN_POINTS = 2;

export default function WallConfigPage() {
  const [sources, setSources] = useState<CameraSource[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [wall, setWall] = useState<WallConfiguration | null>(null);
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
    setWall(null);
    setSaveMessage(null);
    getApiClient()
      .getWallConfiguration(selectedId)
      .then((res) => {
        if (res.ok) setWall(res.data);
        else setError(res.error);
      });
  }, [selectedId]);

  const handlePointsChange = (points: NormalizedPoint[]) => {
    if (!wall) return;
    setWall({ ...wall, points });
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!wall) return;
    setSaving(true);
    setSaveMessage(null);
    const res = await getApiClient().saveWallConfiguration(wall);
    setSaving(false);
    if (res.ok) {
      setWall(res.data);
      setSaveMessage("Wall boundary saved.");
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
              title="Wall / Boundary"
              description="Click on the frame to place points along the wall used for possible-climbing detection."
            />

            {!wall ? (
              <LoadingState label="Loading wall configuration" />
            ) : (
              <>
                <PointEditor
                  mode="line"
                  points={wall.points}
                  onChange={handlePointsChange}
                  minPoints={MIN_POINTS}
                  accentColor="var(--color-signal-high)"
                  accentDim="var(--color-signal-high-dim)"
                />

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-hairline">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving || (wall.points.length > 0 && wall.points.length < MIN_POINTS)}
                  >
                    {saving ? "Saving…" : "Save boundary"}
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
