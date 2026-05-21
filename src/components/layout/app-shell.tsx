"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { AuthProfile } from "@/types/auth";

type AppShellProps = {
  children: ReactNode;
  profile: AuthProfile;
};

export function AppShell({ children, profile }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-3 md:px-4 md:py-4 lg:px-5 lg:py-5">
      <div className="pointer-events-none fixed inset-0 -z-20 tech-grid opacity-50" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(circle_at_82%_-10%,rgba(56,189,248,0.08),transparent_34%),radial-gradient(circle_at_12%_110%,rgba(15,23,42,0.7),transparent_42%)]" />

      <div className="grid min-h-[calc(100vh-1.5rem)] gap-3 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-4">
        <Sidebar profile={profile} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-col gap-3 lg:gap-4">
          <Topbar profile={profile} onMenuClick={() => setSidebarOpen((value) => !value)} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {sidebarOpen ? (
        <button
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </div>
  );
}
