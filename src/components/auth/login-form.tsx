"use client";

import { AlertCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { getHomeRouteForRole } from "@/config/permissions";
import { createClient } from "@/lib/supabase/browser";
import type { AppRole } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(getInitialError(searchParams.get("error")));
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("أدخل البريد الإلكتروني وكلمة المرور.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError("بيانات الدخول غير صحيحة أو أن الحساب غير مفعل.");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("status,roles!inner(key)")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.status === "disabled") {
        await supabase.auth.signOut();
        setError("هذا الحساب معطل. تواصل مع مدير النظام.");
        return;
      }

      const role = getRoleFromProfile(profile);
      const redirectTo = sanitizeRedirect(searchParams.get("redirectTo"));
      router.replace(redirectTo ?? getHomeRouteForRole(role));
      router.refresh();
    });
  }

  return (
    <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 shadow-premium sm:p-8">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-electric to-cyanx text-white shadow-glow">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <div className="mt-5 text-center">
        <p className="text-sm font-black text-cyanx">DevHub</p>
        <h2 className="mt-2 text-3xl font-black">تسجيل الدخول</h2>
        <p className="mt-3 text-sm leading-7 text-muted">استخدم حساب Supabase للوصول إلى لوحة التحكم.</p>
      </div>

      {error ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          <AlertCircle className="mt-1 h-5 w-5 flex-none" />
          <span>{error}</span>
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-muted">البريد الإلكتروني</span>
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-slate-950/45 px-4 transition focus-within:border-cyanx/45">
            <Mail className="h-5 w-5 text-muted" />
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="h-12 w-full bg-transparent text-left text-foreground outline-none placeholder:text-muted"
              placeholder="name@company.com"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-muted">كلمة المرور</span>
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-slate-950/45 px-4 transition focus-within:border-cyanx/45">
            <LockKeyhole className="h-5 w-5 text-muted" />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-12 w-full bg-transparent text-left text-foreground outline-none placeholder:text-muted"
              placeholder="••••••••"
            />
          </div>
        </label>

        <button className="premium-button w-full" disabled={pending}>
          {pending ? "جاري التحقق..." : "دخول إلى DevHub"}
        </button>
      </form>
    </div>
  );
}

function getRoleFromProfile(profile: unknown): AppRole {
  if (!profile || typeof profile !== "object") {
    return "member";
  }

  const roles = "roles" in profile ? profile.roles : undefined;
  const role = Array.isArray(roles)
    ? roles[0]?.key
    : roles && typeof roles === "object" && "key" in roles
      ? roles.key
      : null;

  return isAppRole(role) ? role : "member";
}

function isAppRole(role: unknown): role is AppRole {
  return role === "admin" || role === "team_lead" || role === "member" || role === "viewer";
}

function getInitialError(error: string | null) {
  if (error === "disabled") {
    return "هذا الحساب معطل. تواصل مع مدير النظام.";
  }

  return null;
}

function sanitizeRedirect(value: string | null) {
  if (!value || value === "/login" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}
