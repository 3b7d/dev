import { AppShell } from "@/components/layout/app-shell";
import { UserCreateForm } from "@/components/users/user-create-form";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type UserRow = {id:string;full_name:string|null;email:string;status:"active"|"disabled";created_at:string;roles:{key:string}|{key:string}[]|null};

export default async function UsersPage() {
  const profile = await requireProfile();
  if (profile.role !== "admin") return <AppShell profile={profile}><section className="glass-card">غير مصرح لك.</section></AppShell>;
  const supabase = await createClient();
  const { data: usersData } = await supabase.from("users").select("id,full_name,email,status,created_at,roles!inner(key,name)").order("created_at", { ascending: false });
  return <AppShell profile={profile}><div className="space-y-4"><section className="glass-panel rounded-[2rem] p-6 md:p-8"><h1 className="text-4xl font-black">إدارة المستخدمين</h1><p className="mt-3 text-muted">متاح فقط لحسابات الأدمن.</p></section><section className="glass-card"><h2 className="section-title">إنشاء مستخدم جديد</h2><UserCreateForm /></section><section className="glass-card overflow-auto"><h2 className="section-title mb-4">المستخدمون الحاليون</h2><table className="w-full text-right text-sm"><thead><tr className="border-b border-border"><th>الاسم</th><th>البريد</th><th>الدور</th><th>تاريخ الإنشاء</th><th>الحالة</th></tr></thead><tbody>{((usersData??[]) as UserRow[]).map((u)=><tr key={u.id} className="border-b border-border/40"><td className="py-2">{u.full_name??"-"}</td><td>{u.email}</td><td>{Array.isArray(u.roles)?u.roles[0]?.key:u.roles?.key}</td><td>{new Date(u.created_at).toLocaleDateString("en-CA")}</td><td>{u.status==="disabled"?"inactive":"active"}</td></tr>)}</tbody></table></section></div></AppShell>;
}
