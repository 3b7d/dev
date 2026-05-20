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
        "glass-panel fixed bottom-3 right-3 top-3 z-40 flex w-[min(21rem,calc(100vw-1.5rem))] flex-col rounded-[1.75rem] p-5 transition duration-300 lg:sticky lg:top-5 lg:z-10 lg:h-[calc(100vh-2.5rem)] lg:w-auto lg:translate-x-0",
        open ? "translate-x-0" : "translate-x-[calc(100%+2rem)]",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-electric to-cyanx text-base font-black text-white shadow-glow">
            DH
          </div>
          <div>
            <p className="text-xl font-black leading-none">DevHub</p>
            <p className="mt-1 text-xs font-medium text-muted">مركز إدارة قسم التطوير</p>
          </div>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border text-muted transition hover:border-cyanx/40 hover:text-foreground lg:hidden"
          onClick={onClose}
          aria-label="إغلاق القائمة"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-6 grid gap-2">
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
            "group relative flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-right text-sm font-bold transition",
            active
              ? "border-electric/35 bg-electric/15 text-foreground shadow-[inset_0_0_24px_rgba(34,211,238,0.05)]"
              : "border-transparent text-muted hover:border-border hover:bg-slate-950/35 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-55",
          );

          const content = (
            <>
              {active ? (
                <span className="absolute -right-5 h-7 w-1 rounded-full bg-gradient-to-b from-cyanx to-electric shadow-glow" />
              ) : null}
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
              {disabled ? (
                <span className="mr-auto text-[0.68rem] text-muted/70">{roleBlocked ? "غير متاح" : "لاحقًا"}</span>
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

      <div className="mt-auto rounded-3xl border border-cyanx/25 bg-gradient-to-br from-cyanx/10 to-electric/10 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_16px_rgba(16,185,129,0.85)]" />
          صحة الفريق
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <strong className="text-4xl font-black">92%</strong>
          <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-black text-emerald-200">
            مستقر
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted">
          التقدم مستقر، مع عائق واحد يحتاج متابعة من قائد الفريق.
        </p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-700/40">
          <div className="h-full w-[92%] rounded-full bg-gradient-to-l from-success via-cyanx to-electric shadow-glow" />
        </div>
      </div>
    </aside>
  );
}
