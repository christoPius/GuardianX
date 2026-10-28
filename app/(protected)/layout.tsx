import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { getSession } from "@/lib/auth/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav user={session} />
        <StatusBar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
