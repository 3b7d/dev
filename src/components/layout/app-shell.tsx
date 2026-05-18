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
    <div className="relative min-h-screen overflow-hidden p-3 lg:p-5">
      <div className="pointer-events-none fixed inset-0 -z-20 tech-grid opacity-80" />
      <div className="pointer-events-none fixed -right-28 -top-40 -z-10 h-96 w-96 rounded-full bg-electric/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-44 left-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyanx/20 blur-3xl" />

      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Sidebar profile={profile} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-col gap-4">
          <Topbar profile={profile} onMenuClick={() => setSidebarOpen((value) => !value)} />
          <main>{children}</main>
        </div>
      </div>

      {sidebarOpen ? (
        <button
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </div>
  );
}
