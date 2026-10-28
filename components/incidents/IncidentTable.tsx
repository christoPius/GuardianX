import Link from "next/link";
import type { Incident } from "@/types";
import { SeverityBadge, ReviewBadge } from "@/components/ui/Badge";
import { EVENT_TYPE_LABEL } from "@/lib/utils/severity";
import { formatTimestamp } from "@/lib/utils/format";

export function IncidentTable({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="border border-hairline rounded-[4px] overflow-hidden bg-panel">
      {/* Desktop table */}
      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs font-data text-ink-muted uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Severity</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Review</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-b border-hairline last:border-0 hover:bg-panel-raised transition-colors">
              <td className="px-4 py-3">
                <Link href={`/incidents/${incident.id}`} className="text-ink hover:underline underline-offset-2">
                  {EVENT_TYPE_LABEL[incident.eventType]}
                </Link>
                <p className="text-xs text-ink-faint font-data mt-0.5">Track #{incident.trackId}</p>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={incident.severity} />
              </td>
              <td className="px-4 py-3 font-data text-ink-muted">{incident.score}</td>
              <td className="px-4 py-3 text-ink-muted">{incident.sourceName}</td>
              <td className="px-4 py-3 font-data text-ink-muted whitespace-nowrap">
                {formatTimestamp(incident.startedAt)}
              </td>
              <td className="px-4 py-3">
                <ReviewBadge status={incident.feedback.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y divide-hairline">
        {incidents.map((incident) => (
          <li key={incident.id}>
            <Link
              href={`/incidents/${incident.id}`}
              className="flex flex-col gap-2 px-4 py-3.5 hover:bg-panel-raised transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink">{EVENT_TYPE_LABEL[incident.eventType]}</p>
                  <p className="text-xs text-ink-faint font-data mt-0.5">
                    {incident.sourceName} · Track #{incident.trackId}
                  </p>
                </div>
                <SeverityBadge severity={incident.severity} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-data text-ink-muted">
                  {formatTimestamp(incident.startedAt)} · Score {incident.score}
                </span>
                <ReviewBadge status={incident.feedback.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
