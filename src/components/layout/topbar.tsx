"use client";

import { Bell, Menu, Plus, Search } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { AuthProfile } from "@/types/auth";

type TopbarProps = {
  onMenuClick: () => void;
  profile: AuthProfile;
};

export function Topbar({ onMenuClick, profile }: TopbarProps) {
  const initials = profile.fullName.trim().slice(0, 1) || "D";
  const canCreate = profile.role !== "viewer";

  return (
    <header className="sticky top-3 z-20 flex min-h-[3.9rem] flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm lg:top-5">
      <button
        className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted transition hover:border-cyanx/40 hover:text-foreground lg:hidden"
        onClick={onMenuClick}
        aria-label="فتح القائمة"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <label className="order-3 flex h-9 min-w-full flex-1 items-center gap-2 rounded-xl border border-border bg-surface-secondary px-3 text-muted lg:order-none lg:min-w-64">
        <Search className="h-4 w-4" />
        <input
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          placeholder="ابحث عن مهمة، مشروع، تقرير..."
          type="search"
        />
      </label>

      <div className="mr-auto flex items-center gap-2">
        <button
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface-secondary text-muted transition hover:border-cyanx/40 hover:text-foreground"
          aria-label="الإشعارات"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-success" />
        </button>

        <ThemeToggle />

        {canCreate ? (
          <button className="premium-button h-9 px-3.5 text-xs">
            <Plus className="h-4 w-4" />
            <span>إضافة سريعة</span>
          </button>
        ) : (
          <span className="hidden h-9 items-center rounded-xl border border-border bg-surface-secondary px-3 text-xs font-bold text-muted sm:inline-flex">
            مشاهدة فقط
          </span>
        )}

        <div className="hidden h-9 items-center gap-2 rounded-xl border border-border bg-surface-secondary py-1 pl-3 pr-1.5 md:flex">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-electric to-cyanx text-xs font-bold text-white">
            {initials}
          </div>
          <div className="leading-tight">
            <strong className="block max-w-28 truncate text-xs font-bold">{profile.fullName}</strong>
            <span className="text-[11px] text-muted">{profile.roleLabel}</span>
          </div>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
