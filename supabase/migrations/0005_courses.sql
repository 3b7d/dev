-- DevHub phase 6: courses and learning.
-- Creates courses, course notes, and a private storage bucket for certificates.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-certificates',
  'course-certificates',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  url text,
  status text not null default 'planned',
  progress integer not null default 0,
  user_id uuid not null references public.users(id) on delete cascade,
  start_date date,
  completed_at date,
  certificate_url text,
  certificate_path text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_status_check check (status in ('planned', 'in_progress', 'completed', 'paused')),
  constraint courses_progress_check check (progress >= 0 and progress <= 100)
);

create index if not exists courses_user_id_idx on public.courses(user_id);
create index if not exists courses_status_idx on public.courses(status);
create index if not exists courses_created_by_idx on public.courses(created_by);

drop trigger if exists courses_touch_updated_at on public.courses;
create trigger courses_touch_updated_at
before update on public.courses
for each row execute function public.touch_updated_at();

create table if not exists public.course_notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  summary text not null,
  lesson_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_notes_course_id_idx on public.course_notes(course_id);
create index if not exists course_notes_user_id_idx on public.course_notes(user_id);
create index if not exists course_notes_lesson_date_idx on public.course_notes(lesson_date);

drop trigger if exists course_notes_touch_updated_at on public.course_notes;
create trigger course_notes_touch_updated_at
before update on public.course_notes
for each row execute function public.touch_updated_at();

alter table public.courses enable row level security;
alter table public.course_notes enable row level security;

drop policy if exists "courses are readable by role" on public.courses;
create policy "courses are readable by role"
on public.courses
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "courses insert by editors" on public.courses;
create policy "courses insert by editors"
on public.courses
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
    and created_by = auth.uid()
  )
);

drop policy if exists "courses update by editors" on public.courses;
create policy "courses update by editors"
on public.courses
for update
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and (user_id = auth.uid() or created_by = auth.uid())
  )
)
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  )
);

drop policy if exists "courses delete by managers and owners" on public.courses;
create policy "courses delete by managers and owners"
on public.courses
for delete
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and created_by = auth.uid()
  )
);

drop policy if exists "course notes are readable by role" on public.course_notes;
create policy "course notes are readable by role"
on public.course_notes
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
);

drop policy if exists "course notes insert by editors" on public.course_notes;
create policy "course notes insert by editors"
on public.course_notes
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  )
);

drop policy if exists "course notes update by editors" on public.course_notes;
create policy "course notes update by editors"
on public.course_notes
for update
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
)
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
);

drop policy if exists "course notes delete by editors" on public.course_notes;
create policy "course notes delete by editors"
on public.course_notes
for delete
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
);

drop policy if exists "course certificates readable by authenticated users" on storage.objects;
create policy "course certificates readable by authenticated users"
on storage.objects
for select
to authenticated
using (bucket_id = 'course-certificates');

drop policy if exists "course certificates upload by authenticated users" on storage.objects;
create policy "course certificates upload by authenticated users"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'course-certificates');
