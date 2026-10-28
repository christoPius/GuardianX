import Link from "next/link";
import type { Incident } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { EVENT_TYPE_LABEL } from "@/lib/utils/severity";
import { formatRelativeTime } from "@/lib/utils/format";

export function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  const recent = incidents.slice(0, 7);

  return (
    <Card>
      <CardHeader
        title="Recent Incidents"
        description="Most recent detections across all sources"
        action={
          <Link href="/incidents" className="text-sm text-signal-info hover:underline underline-offset-2">
            View all
          </Link>
        }
      />
      {recent.length === 0 ? (
        <EmptyState
          title="No incidents yet"
          description="Detected events will appear here once monitoring picks something up."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-hairline -mx-5">
          {recent.map((incident) => (
            <li key={incident.id}>
              <Link
                href={`/incidents/${incident.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-panel-raised transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{EVENT_TYPE_LABEL[incident.eventType]}</p>
                  <p className="text-xs text-ink-muted font-data mt-0.5">
                    {incident.sourceName} · {formatRelativeTime(incident.startedAt)}
                  </p>
                </div>
                <SeverityBadge severity={incident.severity} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
