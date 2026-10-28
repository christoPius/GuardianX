import type { EvidenceFactor, Severity } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { severityColorVars } from "@/lib/utils/severity";

export function ScoreBreakdown({
  score,
  severity,
  factors,
  explanation,
}: {
  score: number;
  severity: Severity;
  factors: EvidenceFactor[];
  explanation: string;
}) {
  const { fg } = severityColorVars(severity);

  return (
    <Card>
      <CardHeader title="Risk Score" description="Calculated by the risk engine, not the frontend" />

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-4xl" style={{ color: fg }}>
          {score}
        </span>
        <span className="text-sm text-ink-muted">/ 100</span>
      </div>

      <ul className="flex flex-col gap-1.5 mb-4">
        {factors.map((factor, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between text-sm px-3 py-2 rounded-[3px] bg-panel-raised"
          >
            <span className="text-ink-muted">{factor.label}</span>
            <span className="font-data text-ink">+{factor.points}</span>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-hairline">
        <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-1.5">Explanation</p>
        <p className="text-sm text-ink-muted leading-relaxed">{explanation}</p>
      </div>
    </Card>
  );
}
