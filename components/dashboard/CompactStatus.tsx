import type { CameraSource, MonitoringStatus } from "@/types";

// A single-line, low-weight status readout — not a card. Monitoring state
// is the only thing that belongs at a glance on the dashboard; backend
// health is surfaced separately as a banner only when something is wrong
// (see DisconnectedBanner), not as a permanent card here.
export function CompactMonitoringStatus({
  status,
  activeSource,
}: {
  status: MonitoringStatus;
  activeSource: CameraSource | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm mb-5">
      <span
        className={`w-2 h-2 rounded-full ${
          status.isRunning ? "bg-signal-low animate-pulse-dot" : "bg-ink-faint"
        }`}
        aria-hidden="true"
      />
      <span className="text-ink font-medium">
        {status.isRunning ? "Monitoring active" : "Monitoring paused"}
      </span>
      {activeSource && (
        <>
          <span className="text-ink-faint" aria-hidden="true">
            ·
          </span>
          <span className="text-ink-muted">{activeSource.displayName}</span>
        </>
      )}
    </div>
  );
}
