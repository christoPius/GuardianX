import type { EventType, Severity } from "@/types";
import { EVENT_TYPE_LABEL, SEVERITY_LABEL } from "@/lib/utils/severity";

interface Props {
  severity: Severity | "all";
  eventType: EventType | "all";
  onSeverityChange: (value: Severity | "all") => void;
  onEventTypeChange: (value: EventType | "all") => void;
}

const selectClasses =
  "bg-panel-raised border border-hairline-strong rounded-[3px] px-3 py-1.5 text-sm text-ink focus:border-signal-info";

export function IncidentFilters({ severity, eventType, onSeverityChange, onEventTypeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="severity-filter" className="text-xs font-data text-ink-muted">
          Severity
        </label>
        <select
          id="severity-filter"
          className={selectClasses}
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as Severity | "all")}
        >
          <option value="all">All severities</option>
          {(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="event-filter" className="text-xs font-data text-ink-muted">
          Event type
        </label>
        <select
          id="event-filter"
          className={selectClasses}
          value={eventType}
          onChange={(e) => onEventTypeChange(e.target.value as EventType | "all")}
        >
          <option value="all">All event types</option>
          {(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((e) => (
            <option key={e} value={e}>
              {EVENT_TYPE_LABEL[e]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
