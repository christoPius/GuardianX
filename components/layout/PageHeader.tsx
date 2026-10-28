import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-[28px] text-ink tracking-tight">{title}</h1>
        {description && <p className="text-sm text-ink-muted mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}
