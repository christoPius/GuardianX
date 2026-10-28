import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted" role="status" aria-live="polite">
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-pulse-dot" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-pulse-dot" style={{ animationDelay: "200ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-faint animate-pulse-dot" style={{ animationDelay: "400ms" }} />
      </div>
      <p className="text-sm font-data">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
      {icon && <div className="text-ink-faint mb-1">{icon}</div>}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center"
      role="alert"
    >
      <div className="w-8 h-8 rounded-full bg-signal-high-dim text-signal-high flex items-center justify-center font-data text-sm mb-1">
        !
      </div>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm">{description}</p>}
      {onRetry && (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

export function DisconnectedBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-[4px] border border-signal-high/30 bg-signal-high-dim text-signal-high text-sm"
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-high" aria-hidden="true" />
        <span>Backend disconnected — showing last known data where available.</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline underline-offset-2 hover:no-underline">
          Retry connection
        </button>
      )}
    </div>
  );
}
