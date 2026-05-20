# DevHub | مركز إدارة قسم التطوير

واجهة داخلية لإدارة قسم التطوير (مهام، إنجازات يومية، مشاريع، دورات، وتقارير) مبنية بـ Next.js و Supabase.

## متطلبات التشغيل

- Node.js 20+
- npm 10+
- مشروع Supabase جاهز

## متغيرات البيئة المطلوبة

أنشئ ملف `.env.local` في جذر المشروع وضع القيم التالية:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-or-anon-key"
```

> ملاحظة: لا تضع مفاتيح سرية (Service Role) داخل تطبيق الواجهة.

## ترتيب تشغيل ملفات Supabase Migrations

نفّذ ملفات SQL بالترتيب التالي:

1. `supabase/migrations/0001_auth_roles.sql`
2. `supabase/migrations/0002_tasks.sql`
3. `supabase/migrations/0003_daily_achievements.sql`
4. `supabase/migrations/0004_projects.sql`
5. `supabase/migrations/0005_courses.sql`
6. `supabase/migrations/0006_reports_read_access.sql`

## التشغيل المحلي

```bash
npm install
npm run dev
```

ثم افتح:

```txt
http://localhost:3000
```

## أوامر التحقق

```bash
npm run lint
npm run build
```

- `npm run lint`: يتحقق من جودة الكود باستخدام ESLint بدون أي شاشة تفاعلية.
- `npm run build`: يتأكد أن التطبيق يبنى بنجاح للإنتاج.

## إعداد يدوي مطلوب بعد التعديلات

1. تأكد من وجود ملف `.env.local` بالقيم المطلوبة أعلاه.
2. تأكد من تنفيذ ملفات migrations بالترتيب.
3. بعد سحب التعديلات الجديدة، شغّل `npm install` لتثبيت حزمة الخط المحلية `@fontsource/tajawal`.

## ملاحظات حول الخط العربي

تم اعتماد خط **Tajawal** عبر حزمة محلية (`@fontsource/tajawal`) بدل الجلب من Google Fonts وقت البناء؛ للحفاظ على الشكل العربي نفسه قدر الإمكان وتفادي فشل البناء عند ضعف/انقطاع الشبكة.
