-- DevHub phase 5: projects module.
-- Extends the projects reference table created in phase 3.

alter table public.projects
add column if not exists owner_id uuid references public.users(id) on delete set null,
add column if not exists priority text not null default 'medium',
add column if not exists progress integer not null default 0,
add column if not exists start_date date,
add column if not exists due_date date;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_priority_check') then
    alter table public.projects
    add constraint projects_priority_check check (priority in ('low', 'medium', 'high', 'urgent'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'projects_progress_check') then
    alter table public.projects
    add constraint projects_progress_check check (progress >= 0 and progress <= 100);
  end if;
end;
$$;

create index if not exists projects_owner_id_idx on public.projects(owner_id);
create index if not exists projects_status_idx on public.projects(status);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  url text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_links_project_id_idx on public.project_links(project_id);

create table if not exists public.project_timeline_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null default current_date,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_timeline_events_project_id_idx on public.project_timeline_events(project_id);
create index if not exists project_timeline_events_event_date_idx on public.project_timeline_events(event_date);

alter table public.project_links enable row level security;
alter table public.project_timeline_events enable row level security;

drop policy if exists "project links are readable by authenticated users" on public.project_links;
create policy "project links are readable by authenticated users"
on public.project_links
for select
to authenticated
using (true);

drop policy if exists "admins and leads can manage project links" on public.project_links;
create policy "admins and leads can manage project links"
on public.project_links
for all
to authenticated
using (public.current_user_role() in ('admin', 'team_lead'))
with check (public.current_user_role() in ('admin', 'team_lead'));

drop policy if exists "project timeline is readable by authenticated users" on public.project_timeline_events;
create policy "project timeline is readable by authenticated users"
on public.project_timeline_events
for select
to authenticated
using (true);

drop policy if exists "admins and leads can manage project timeline" on public.project_timeline_events;
create policy "admins and leads can manage project timeline"
on public.project_timeline_events
for all
to authenticated
using (public.current_user_role() in ('admin', 'team_lead'))
with check (public.current_user_role() in ('admin', 'team_lead'));
