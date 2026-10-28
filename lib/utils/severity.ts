import type { EventType, Severity } from "@/types";

// The backend is the authority on score → severity mapping. This mirrors
// that policy purely for local sorting/labeling; the frontend never
// recalculates a score itself, it only reads `incident.severity` and
// `incident.score` as returned by the API.
export const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  loitering: "Loitering",
  restricted_zone_entry: "Restricted Zone Entry",
  boundary_crossing: "Boundary Crossing",
  possible_wall_climbing: "Possible Wall Climbing",
};

export function severityColorVars(severity: Severity): {
  fg: string;
  bg: string;
} {
  switch (severity) {
    case "high":
      return { fg: "var(--color-signal-high)", bg: "var(--color-signal-high-dim)" };
    case "medium":
      return { fg: "var(--color-signal-medium)", bg: "var(--color-signal-medium-dim)" };
    case "low":
      return { fg: "var(--color-signal-low)", bg: "var(--color-signal-low-dim)" };
  }
}
