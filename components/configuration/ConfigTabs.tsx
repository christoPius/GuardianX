"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/configuration/source", label: "Source" },
  { href: "/configuration/zone", label: "Restricted Zone" },
  { href: "/configuration/wall", label: "Wall / Boundary" },
  { href: "/configuration/settings", label: "Monitoring Settings" },
] as const;

export function ConfigTabs() {
  const pathname = usePathname();
  return (
    <div
      className="flex gap-1 border-b border-hairline mb-6 overflow-x-auto"
      role="tablist"
      aria-label="Configuration sections"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`px-3.5 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active
                ? "border-signal-info text-ink font-medium"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
