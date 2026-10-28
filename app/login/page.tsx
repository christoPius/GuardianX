import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { isUsingLocalDemoCredentials } from "@/lib/auth/credentials";
import { getSession } from "@/lib/auth/server";

function getNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const { next } = await searchParams;
  return (
    <main className="min-h-screen px-4 py-10 sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto w-full max-w-md rounded-[4px] border border-hairline bg-panel p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-signal-info/60 text-signal-info" aria-hidden="true">
              ◉
            </span>
            <span className="font-display text-xl tracking-tight text-ink">NightGuard AI</span>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Sign in to access your local surveillance dashboard.
          </p>
        </div>

        <LoginForm next={getNextPath(next)} showDemoCredentials={isUsingLocalDemoCredentials()} />
      </div>
    </main>
  );
}
