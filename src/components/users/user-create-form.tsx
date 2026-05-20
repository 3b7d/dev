"use client";

import { useActionState } from "react";
import { createManagedUser, type CreateUserState } from "@/app/users/actions";

const initialState: CreateUserState = { status: "idle", message: "" };

export function UserCreateForm() {
  const [state, action, pending] = useActionState(createManagedUser, initialState);

  return (
    <>
      <form action={action} className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded-2xl border border-border bg-slate-950/45 px-4 py-3" name="fullName" placeholder="الاسم الكامل" required />
        <input className="rounded-2xl border border-border bg-slate-950/45 px-4 py-3" name="email" type="email" placeholder="البريد الإلكتروني" required />
        <input className="rounded-2xl border border-border bg-slate-950/45 px-4 py-3" name="password" type="password" placeholder="كلمة المرور المؤقتة" minLength={8} required />
        <select className="rounded-2xl border border-border bg-slate-950/45 px-4 py-3" name="role" defaultValue="member">
          <option value="admin">admin</option><option value="member">user (member)</option>
        </select>
        <select className="rounded-2xl border border-border bg-slate-950/45 px-4 py-3" name="status" defaultValue="active">
          <option value="active">active</option><option value="disabled">inactive</option>
        </select>
        <button className="premium-button md:col-span-2" type="submit" disabled={pending}>{pending ? "جاري الإنشاء..." : "إنشاء المستخدم"}</button>
      </form>
      {state.message ? <p className={`mt-3 rounded-2xl border px-4 py-3 text-sm ${state.status === "success" ? "border-success/30 bg-success/10 text-emerald-100" : "border-red-400/30 bg-red-500/10 text-red-100"}`}>{state.message}</p> : null}
    </>
  );
}
