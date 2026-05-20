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
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> ملاحظة مهمة: لا تضع مفتاح `SUPABASE_SERVICE_ROLE_KEY` داخل كود الواجهة أو أي ملف يتم تشغيله في المتصفح. هذا المفتاح يستخدم على السيرفر فقط لميزة إدارة المستخدمين.

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
3. بعد سحب التعديلات الجديدة، شغّل `npm install` لتثبيت الحزم الجديدة، ومنها حزمة الخط المحلية `@fontsource/tajawal`.
4. تأكد أن مفتاح `SUPABASE_SERVICE_ROLE_KEY` مضاف في بيئة السيرفر فقط، سواء محلياً أو في Vercel/Netlify.

## ملاحظات حول الخط العربي

تم اعتماد خط **Tajawal** عبر حزمة محلية (`@fontsource/tajawal`) بدل الجلب من Google Fonts وقت البناء؛ للحفاظ على الشكل العربي نفسه قدر الإمكان وتفادي فشل البناء عند ضعف أو انقطاع الشبكة.

## إدارة المستخدمين Admin فقط

تمت إضافة صفحة **إدارة المستخدمين** على المسار:

```txt
/users
```

### ماذا تفعل الميزة

- إنشاء مستخدم جديد في `Supabase Auth`.
- إنشاء أو تحديث سجل المستخدم في جدول `public.users`.
- ربط المستخدم بالدور المحدد مثل `admin` أو `member`.
- دعم الحالة `active` أو `inactive` إذا كانت مدعومة في بنية قاعدة البيانات.

### إعدادات Supabase اليدوية المطلوبة

1. تأكد أن جدول `public.roles` يحتوي الأدوار الأساسية، ويتم ذلك عبر migration `0001`.
2. تأكد أن الحساب الذي يفتح صفحة `/users` لديه صلاحية Admin.
3. لتعيين مستخدم كـ Admin، استخدم الأمر التالي مع تعديل البريد:

```sql
update public.users
set role_id = (select id from public.roles where key = 'admin')
where email = 'admin@company.com';
```

### خطوات اختبار الميزة

1. سجّل الدخول بحساب Admin.
2. افتح المسار `/users`.
3. أنشئ مستخدمًا جديدًا عبر النموذج.
4. تأكد من ظهور رسالة نجاح.
5. تأكد من ظهور المستخدم في جدول المستخدمين.
6. جرّب فتح نفس الصفحة بحساب غير Admin للتأكد من المنع.