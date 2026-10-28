"use client";

import { useState } from "react";
import type { CameraSource } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

export function CameraOverview({
  sources,
  activeSourceId,
  onSelectSource,
}: {
  sources: CameraSource[];
  activeSourceId: string | null;
  onSelectSource: (source: CameraSource) => void;
}) {
  const [sourceOrder, setSourceOrder] = useState<string[]>([]);
  const onlineCount = sources.filter((source) => source.status === "online").length;
  const orderedSources = [...sources].sort((left, right) => {
    const leftOrder = sourceOrder.indexOf(left.id);
    const rightOrder = sourceOrder.indexOf(right.id);
    if (leftOrder < 0 && rightOrder < 0) return sources.indexOf(left) - sources.indexOf(right);
    if (leftOrder < 0) return 1;
    if (rightOrder < 0) return -1;
    return leftOrder - rightOrder;
  });

  const selectSource = (source: CameraSource) => {
    const nextOrder = orderedSources.map((item) => item.id);
    const previousViewIndex = activeSourceId ? nextOrder.indexOf(activeSourceId) : -1;
    const selectedIndex = nextOrder.indexOf(source.id);
    if (previousViewIndex >= 0 && selectedIndex >= 0) {
      [nextOrder[previousViewIndex], nextOrder[selectedIndex]] = [
        nextOrder[selectedIndex],
        nextOrder[previousViewIndex],
      ];
      setSourceOrder(nextOrder);
    }
    onSelectSource(source);
  };

  const renderCameraScene = (patternId: string) => (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="#18212a" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="640" height="360" fill="#0a0d12" />
      <rect width="640" height="360" fill={`url(#${patternId})`} />
      <path d="M0 284 176 176l132 74 134-120 198 124v106H0Z" fill="#101820" />
      <path d="M0 284 176 176l132 74 134-120 198 124" fill="none" stroke="#263441" strokeWidth="3" />
      <path d="M72 360V272l62-40 64 40v88m254 0v-80l54-34 62 34v80" fill="none" stroke="#263441" strokeWidth="3" />
    </svg>
  );

  return (
    <Card>
      <CardHeader
        title="House Cameras"
        description={`${onlineCount} of ${sources.length} cameras online`}
      />

      {sources.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">No cameras configured</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {orderedSources.map((source, index) => {
            const active = source.id === activeSourceId;
            const previewMessage =
              source.status === "online"
                ? "PREVIEW UNAVAILABLE"
                : source.status === "offline"
                  ? "CAMERA OFFLINE"
                  : source.status === "connecting"
                    ? "CONNECTING"
                    : "CAMERA ERROR";
            const statusColor =
              source.status === "online"
                ? "text-signal-low"
                : source.status === "error"
                  ? "text-signal-high"
                  : source.status === "connecting"
                    ? "text-signal-medium"
                    : "text-ink-faint";

            return (
              <li key={source.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => selectSource(source)}
                  aria-label={`Show ${source.displayName} in Live View`}
                  className="block w-full overflow-hidden rounded-[3px] border border-hairline bg-panel-raised text-left transition-colors hover:border-hairline-strong focus-visible:border-signal-info"
                >
                  <div className="relative aspect-video overflow-hidden bg-[#080b0e]">
                    {renderCameraScene(`camera-grid-${index}`)}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="px-2 py-1 rounded-[2px] border border-white/10 bg-black/65 text-[9px] font-data tracking-wide text-ink-muted">
                      {previewMessage}
                    </span>
                  </div>
                  <span className="absolute left-2 top-2 px-1.5 py-0.5 rounded-[2px] bg-black/70 text-[9px] font-data text-ink-muted">
                    CAM {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`absolute right-2 top-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] bg-black/70 text-[9px] font-data uppercase ${statusColor}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor.replace("text-", "bg-")}`} aria-hidden="true" />
                    {source.status}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <p className="min-w-0 truncate text-xs text-ink" title={source.displayName}>
                    {source.displayName}
                  </p>
                  {active && <span className="shrink-0 text-[9px] font-data text-signal-info">LIVE VIEW</span>}
                </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

    </Card>
  );
}