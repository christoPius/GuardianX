import type { EvidenceAsset } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";

export function EvidenceViewer({ evidence }: { evidence: EvidenceAsset }) {
  const hasSnapshot = Boolean(evidence.snapshotUrl);
  const hasClip = Boolean(evidence.clipUrl);

  return (
    <Card>
      <CardHeader title="Evidence" description="Captured automatically at the time of detection" />

      {!hasSnapshot && !hasClip ? (
        <div className="rounded-[4px] border border-dashed border-hairline-strong py-10 px-4 text-center">
          <p className="text-sm text-ink-muted">Evidence unavailable for this incident.</p>
          <p className="text-xs text-ink-faint mt-1">
            The source may have disconnected before capture completed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-2">Snapshot</p>
            {hasSnapshot ? (
              <div className="aspect-video rounded-[4px] border border-hairline bg-[#050708] flex items-center justify-center overflow-hidden">
                <MockFrame />
              </div>
            ) : (
              <div className="rounded-[4px] border border-dashed border-hairline-strong py-8 text-center">
                <p className="text-sm text-ink-faint">Snapshot unavailable</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-data text-ink-muted uppercase tracking-wide mb-2">Video clip</p>
            {hasClip ? (
              <div className="aspect-video rounded-[4px] border border-hairline bg-[#050708] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-ink-faint">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" />
                  </svg>
                  <span className="text-xs font-data">DEMO / MOCK CLIP — playback wired to FastAPI evidence route</span>
                </div>
              </div>
            ) : (
              <div className="rounded-[4px] border border-dashed border-hairline-strong py-8 text-center">
                <p className="text-sm text-ink-faint">Video clip unavailable</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function MockFrame() {
  return (
    <svg viewBox="0 0 640 360" className="w-full h-full opacity-70" aria-hidden="true">
      <rect width="640" height="360" fill="#0a0d12" />
      <rect x="0" y="0" width="640" height="360" fill="url(#evidence-grid)" />
      <defs>
        <pattern id="evidence-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#1a212b" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="260" y="90" width="70" height="150" rx="6" fill="none" stroke="var(--color-signal-high)" strokeWidth="1.6" />
      <text x="260" y="82" fill="var(--color-signal-high)" fontSize="12" fontFamily="var(--font-data)">
        track
      </text>
    </svg>
  );
}
