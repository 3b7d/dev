# DevHub | مركز إدارة قسم التطوير

واجهة المرحلة الأولى من نظام DevHub.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح:

```txt
http://localhost:3000
```

## نطاق المرحلة الأولى

- مشروع Next.js باستخدام App Router.
- إعداد Tailwind CSS.
- RTL كامل من مستوى `html`.
- ثيم داكن Premium Tech.
- Layout عام.
- Sidebar.
- Topbar.
- Dashboard أولية ببيانات وهمية.

كانت المرحلة الأولى بدون ربط قاعدة بيانات. المرحلة الثانية تضيف Supabase Auth والصلاحيات فقط.

## المرحلة الثانية: Supabase Auth

1. أنشئ مشروع Supabase.
2. انسخ القيم إلى `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-or-anon-key"
```

3. شغّل ملف SQL:

```txt
supabase/migrations/0001_auth_roles.sql
```

4. أنشئ مستخدمًا من Supabase Auth، ثم رقّه إلى Admin عند الحاجة:

```sql
update public.users
set role_id = (select id from public.roles where key = 'admin')
where email = 'admin@company.com';
```

5. افتح `/login` وسجل الدخول.

## المرحلة الثالثة: قسم المهام

1. شغّل ملف SQL بعد ملف المرحلة الثانية:

```txt
supabase/migrations/0002_tasks.sql
```

2. أنشئ مشروعًا اختباريًا اختياريًا لربط المهام به:

```sql
insert into public.projects (name, description, created_by)
values (
  'DevHub MVP',
  'مشروع اختباري لربط المهام',
  auth.uid()
);
```

إذا نفذت الأمر من SQL Editor بدون جلسة مستخدم، استبدل `auth.uid()` بمعرف مستخدم موجود من جدول `public.users`.

3. افتح:

```txt
http://localhost:3000/tasks
```

4. اختبر حسب الدور:

- Admin و Team Lead: إضافة، تعديل، حذف، تغيير حالة، وإسناد لأي مستخدم.
- Member: إضافة وتعديل مهامه فقط، والإسناد يكون لنفسه.
- Viewer: لا يستطيع دخول `/tasks` ويتم توجيهه إلى `/unauthorized`.
