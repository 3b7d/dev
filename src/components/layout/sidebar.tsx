"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { sidebarItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { AuthProfile } from "@/types/auth";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  profile: AuthProfile;
};

export function Sidebar({ open, onClose, profile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed bottom-3 right-3 top-3 z-40 flex w-[min(17rem,calc(100vw-1.5rem))] flex-col rounded-2xl border border-border bg-card px-3 py-4 shadow-sm transition duration-300 lg:sticky lg:top-5 lg:z-10 lg:h-[calc(100vh-2.5rem)] lg:w-auto lg:translate-x-0",
        open ? "translate-x-0" : "translate-x-[calc(100%+2rem)]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-1 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyanx text-xs font-black text-white">
            DH
          </div>
          <div>
            <p className="text-base font-extrabold leading-none">DevHub</p>
            <p className="mt-1 text-[11px] text-muted">لوحة التطوير</p>
          </div>
        </div>
        <button
          className="grid h-8 w-8 place-items-center rounded-xl border border-border text-muted transition hover:border-cyanx/40 hover:text-foreground lg:hidden"
          onClick={onClose}
          aria-label="إغلاق القائمة"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-4 grid gap-1.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const roleBlocked =
            (((item.href === "/tasks" ||
              item.href === "/achievements" ||
              item.href === "/projects" ||
              item.href === "/courses") &&
              profile.role === "viewer") ||
              (item.href === "/users" && profile.role !== "admin"));
          const disabled = item.disabled || roleBlocked;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const className = cn(
            "group relative flex min-h-10 items-center gap-2.5 rounded-xl border px-3 text-sm font-semibold transition",
            active
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "border-transparent text-muted hover:border-border hover:bg-surface-secondary hover:text-foreground",
            disabled && "cursor-not-allowed opacity-55",
          );

          const content = (
            <>
              <Icon className="h-4.5 w-4.5" />
              <span className="truncate">{item.title}</span>
              {disabled ? (
                <span className="mr-auto text-[10px] text-muted/70">{roleBlocked ? "غير متاح" : "لاحقًا"}</span>
              ) : null}
            </>
          );

          return disabled ? (
            <button key={item.title} className={className} disabled>
              {content}
            </button>
          ) : (
            <Link key={item.title} className={className} href={item.href} onClick={onClose}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-surface-secondary p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">صحة الفريق</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
            مستقر
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <strong className="text-xl font-bold">92%</strong>
          <span className="h-2 w-2 rounded-full bg-success" />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/70">
          <div className="h-full w-[92%] rounded-full bg-gradient-to-l from-success to-cyanx" />
        </div>
      </div>
    </aside>
  );
}
