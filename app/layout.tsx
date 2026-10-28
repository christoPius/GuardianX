import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NightGuard AI",
  description: "Local-inference CCTV surveillance and incident review dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-ground text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
