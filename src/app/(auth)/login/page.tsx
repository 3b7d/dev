import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen overflow-hidden p-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(28rem,0.8fr)] lg:p-6">
      <div className="pointer-events-none fixed inset-0 -z-20 tech-grid opacity-80" />
      <div className="pointer-events-none fixed -right-28 -top-40 -z-10 h-96 w-96 rounded-full bg-electric/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-44 left-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyanx/20 blur-3xl" />

      <section className="hidden items-center p-8 lg:flex">
        <div className="max-w-3xl">
          <span className="badge border-cyanx/30 bg-cyanx/10 text-cyan-100">DevHub Secure Access</span>
          <h1 className="mt-5 text-6xl font-black leading-[1.08]">
            دخول آمن إلى مركز إدارة قسم التطوير.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-9 text-muted">
            المرحلة الثانية تضيف طبقة المصادقة والصلاحيات، مع توجيه المستخدم حسب دوره وحماية لوحة
            التحكم من الوصول غير المصرح.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {["Admin", "Team Lead", "Member", "Viewer"].map((role) => (
              <div key={role} className="rounded-3xl border border-border bg-slate-950/35 p-4 backdrop-blur-xl">
                <span className="text-sm font-black text-cyanx">{role}</span>
                <p className="mt-2 text-sm leading-7 text-muted">صلاحية معرفة من قاعدة البيانات.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
