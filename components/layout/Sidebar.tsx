"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/auth/actions";
import type { AuthSession } from "@/lib/auth/session";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/incidents", label: "Incidents" },
  { href: "/configuration", label: "Configuration" },
] as const;

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2 L21 6.5 V12.5 C21 17.5 17.3 21.2 12 22.5 C6.7 21.2 3 17.5 3 12.5 V6.5 Z"
          stroke="var(--color-signal-info)"
          strokeWidth="1.6"
          fill="none"
        />
        <circle cx="12" cy="11.5" r="2.6" stroke="var(--color-signal-info)" strokeWidth="1.4" fill="none" />
      </svg>
      <span className="font-display text-[17px] tracking-tight text-ink">NightGuard AI</span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`px-3 py-2 rounded-[3px] text-sm transition-colors ${
              active
                ? "bg-panel-raised text-ink font-medium border-l-2 border-signal-info -ml-px pl-[11px]"
                : "text-ink-muted hover:text-ink hover:bg-panel-raised"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountControls({ user }: { user: AuthSession }) {
  return (
    <div className="border-t border-hairline pt-4">
      <p className="truncate text-sm text-ink">{user.name}</p>
      <p className="truncate text-xs text-ink-faint">{user.email}</p>
      <form action={logout} className="mt-2">
        <button type="submit" className="text-xs text-ink-muted hover:text-ink hover:underline underline-offset-2">
          Sign out
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ user }: { user: AuthSession }) {
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-hairline bg-ground px-4 py-5 gap-8 sticky top-0 h-screen">
      <Logo />
      <NavLinks />
      <div className="mt-auto flex flex-col gap-4">
        <AccountControls user={user} />
        <div className="text-xs text-ink-faint font-data leading-relaxed">
          B.Tech Project
          <br />
          Local inference · No cloud AI
        </div>
      </div>
    </aside>
  );
}

export function MobileNav({ user }: { user: AuthSession }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-ground sticky top-0 z-30">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="p-2 -mr-2 text-ink-muted hover:text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-ground border-r border-hairline px-4 py-5 flex flex-col gap-8 h-full">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 -mr-2 text-ink-muted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <AccountControls user={user} />
            </div>
          </div>
          <button
            className="flex-1 bg-black/60"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
