"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-slate-950/40 text-muted transition hover:border-red-400/40 hover:text-red-200 disabled:opacity-60"
      onClick={handleSignOut}
      disabled={pending}
      aria-label="تسجيل الخروج"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
