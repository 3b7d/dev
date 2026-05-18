"use client";

import { Bell, Menu, Plus, Search } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { AuthProfile } from "@/types/auth";

type TopbarProps = {
  onMenuClick: () => void;
  profile: AuthProfile;
};

export function Topbar({ onMenuClick, profile }: TopbarProps) {
  const initials = profile.fullName.trim().slice(0, 1) || "D";
  const canCreate = profile.role !== "viewer";

  return (
    <header className="glass-panel sticky top-3 z-20 flex min-h-[4.75rem] flex-wrap items-center gap-3 rounded-3xl p-3 lg:top-5">
      <button
        className="grid h-12 w-12 place-items-center rounded-2xl border border-border text-muted transition hover:border-cyanx/40 hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      <label className="order-3 flex h-12 min-w-full flex-1 items-center gap-3 rounded-2xl border border-border bg-slate-950/40 px-4 text-muted lg:order-none lg:min-w-72">
        <Search className="h-5 w-5" />
        <input
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          placeholder="ابحث عن مهمة، مشروع، تقرير..."
          type="search"
        />
        <kbd className="hidden rounded-lg border border-border px-2 py-1 text-xs text-muted sm:block">⌘ K</kbd>
      </label>

      <div className="mr-auto flex items-center gap-2">
        <button
          className="relative grid h-12 w-12 place-items-center rounded-2xl border border-border bg-slate-950/40 text-muted transition hover:border-cyanx/40 hover:text-foreground"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
        </button>

        {canCreate ? (
          <button className="premium-button h-12 px-4 sm:px-5">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">إضافة سريعة</span>
          </button>
        ) : (
          <span className="hidden h-12 items-center rounded-2xl border border-border bg-slate-950/40 px-4 text-sm font-black text-muted sm:inline-flex">
            مشاهدة فقط
          </span>
        )}

        <div className="hidden h-12 items-center gap-3 rounded-2xl border border-border bg-slate-950/35 py-1.5 pl-4 pr-1.5 md:flex">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-electric to-cyanx text-sm font-black text-white">
            {initials}
          </div>
          <div className="leading-tight">
            <strong className="block max-w-36 truncate text-sm font-black">{profile.fullName}</strong>
            <span className="text-xs font-medium text-muted">{profile.roleLabel}</span>
          </div>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
