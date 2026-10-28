"use client";

import { useActionState } from "react";
import { login, type LoginActionState } from "@/app/auth/actions";

const initialState: LoginActionState = undefined;

export function LoginForm({ next, showDemoCredentials }: { next: string; showDemoCredentials: boolean }) {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-data uppercase tracking-wide text-ink-muted">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-[3px] border border-hairline-strong bg-panel-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-data uppercase tracking-wide text-ink-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-[3px] border border-hairline-strong bg-panel-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint"
          placeholder="Enter your password"
        />
      </div>

      {state?.error && (
        <p className="rounded-[3px] border border-signal-high/30 bg-signal-high-dim px-3 py-2.5 text-sm text-signal-high" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[3px] bg-signal-info px-3.5 py-2.5 text-sm font-medium text-ground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {showDemoCredentials && (
        <p className="border-t border-hairline pt-4 text-xs leading-relaxed text-ink-faint">
          Local development account: <span className="font-data text-ink-muted">admin@nightguard.local</span> /{" "}
          <span className="font-data text-ink-muted">nightguard-demo</span>
        </p>
      )}
    </form>
  );
}
