import Link from "next/link";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4 text-center">
      <div className="pointer-events-none fixed inset-0 -z-20 tech-grid opacity-80" />
      <div className="glass-panel max-w-lg rounded-[2rem] p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-3xl font-black">لا تملك صلاحية الوصول</h1>
        <p className="mt-3 leading-8 text-muted">هذه الصفحة محمية حسب دور المستخدم الحالي.</p>
        <Link className="premium-button mt-6" href="/">
          العودة للوحة التحكم
        </Link>
      </div>
    </main>
  );
}
