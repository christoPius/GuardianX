import type { Severity } from "@/types";
import { SEVERITY_LABEL, severityColorVars } from "@/lib/utils/severity";

// Severity is never color-only: each badge also carries a distinct icon
// glyph so the signal survives for color-blind or grayscale viewing.
const SEVERITY_GLYPH: Record<Severity, string> = {
  high: "▲",
  medium: "●",
  low: "▾",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { fg, bg } = severityColorVars(severity);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-data font-medium tracking-wide"
      style={{ color: fg, background: bg }}
    >
      <span aria-hidden="true">{SEVERITY_GLYPH[severity]}</span>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function ReviewBadge({ status }: { status: "unreviewed" | "confirmed" | "false_alarm" }) {
  if (status === "unreviewed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-data text-ink-muted bg-panel-raised border border-hairline">
        Unreviewed
      </span>
    );
  }
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-data text-signal-high bg-signal-high-dim">
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-data text-signal-info bg-signal-info-dim">
      False Alarm
    </span>
  );
}
