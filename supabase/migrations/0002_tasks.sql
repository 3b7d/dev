-- DevHub phase 3: tasks module.
-- This migration creates a minimal projects reference table and the tasks table.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check check (status in ('active', 'paused', 'completed', 'cancelled'))
);

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'new',
  priority text not null default 'medium',
  project_id uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check check (status in ('new', 'in_progress', 'review', 'completed', 'overdue', 'cancelled')),
  constraint tasks_priority_check check (priority in ('low', 'medium', 'high', 'urgent'))
);

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_created_by_idx on public.tasks(created_by);

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
before update on public.tasks
for each row execute function public.touch_updated_at();

create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at = now();
  elsif new.status is distinct from 'completed' then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_set_completed_at on public.tasks;
create trigger tasks_set_completed_at
before update on public.tasks
for each row execute function public.set_task_completed_at();

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "projects are readable by authenticated users" on public.projects;
create policy "projects are readable by authenticated users"
on public.projects
for select
to authenticated
using (true);

drop policy if exists "admins and leads can manage projects reference" on public.projects;
create policy "admins and leads can manage projects reference"
on public.projects
for all
to authenticated
using (public.current_user_role() in ('admin', 'team_lead'))
with check (public.current_user_role() in ('admin', 'team_lead'));

drop policy if exists "tasks are readable by role" on public.tasks;
create policy "tasks are readable by role"
on public.tasks
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or assignee_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "tasks insert by editors" on public.tasks;
create policy "tasks insert by editors"
on public.tasks
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and created_by = auth.uid()
    and (assignee_id is null or assignee_id = auth.uid())
  )
);

drop policy if exists "tasks update by editors" on public.tasks;
create policy "tasks update by editors"
on public.tasks
for update
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and (assignee_id = auth.uid() or created_by = auth.uid())
  )
)
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and (assignee_id is null or assignee_id = auth.uid() or created_by = auth.uid())
  )
);

drop policy if exists "tasks delete by owners" on public.tasks;
create policy "tasks delete by owners"
on public.tasks
for delete
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and created_by = auth.uid()
  )
);
