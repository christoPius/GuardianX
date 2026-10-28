import type { CameraSource } from "@/types";

export function SourceSelector({
  sources,
  selectedId,
  onChange,
}: {
  sources: CameraSource[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 max-w-xs">
      <label htmlFor="source-selector" className="text-xs font-data text-ink-muted uppercase tracking-wide">
        Camera source
      </label>
      <select
        id="source-selector"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-panel-raised border border-hairline-strong rounded-[3px] px-3 py-2 text-sm text-ink focus:border-signal-info"
      >
        {sources.map((s) => (
          <option key={s.id} value={s.id}>
            {s.displayName} {s.status === "offline" ? "(offline)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
