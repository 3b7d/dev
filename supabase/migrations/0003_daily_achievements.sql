-- DevHub phase 4: daily achievements.
-- Achievements can be linked to completed tasks and include tomorrow plan and blockers.

create table if not exists public.daily_achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  achievement_date date not null default current_date,
  user_id uuid not null references public.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  tomorrow_plan text,
  blockers text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_achievements_date_idx on public.daily_achievements(achievement_date);
create index if not exists daily_achievements_user_id_idx on public.daily_achievements(user_id);
create index if not exists daily_achievements_task_id_idx on public.daily_achievements(task_id);
create index if not exists daily_achievements_created_by_idx on public.daily_achievements(created_by);

drop trigger if exists daily_achievements_touch_updated_at on public.daily_achievements;
create trigger daily_achievements_touch_updated_at
before update on public.daily_achievements
for each row execute function public.touch_updated_at();

create or replace function public.ensure_achievement_task_is_completed()
returns trigger
language plpgsql
as $$
declare
  linked_task_status text;
begin
  if new.task_id is null then
    return new;
  end if;

  select status into linked_task_status
  from public.tasks
  where id = new.task_id;

  if linked_task_status is distinct from 'completed' then
    raise exception 'Daily achievements can only be linked to completed tasks.';
  end if;

  return new;
end;
$$;

drop trigger if exists daily_achievements_validate_completed_task on public.daily_achievements;
create trigger daily_achievements_validate_completed_task
before insert or update on public.daily_achievements
for each row execute function public.ensure_achievement_task_is_completed();

alter table public.daily_achievements enable row level security;

drop policy if exists "daily achievements are readable by role" on public.daily_achievements;
create policy "daily achievements are readable by role"
on public.daily_achievements
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "daily achievements insert by editors" on public.daily_achievements;
create policy "daily achievements insert by editors"
on public.daily_achievements
for insert
to authenticated
with check (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  )
);

drop policy if exists "daily achievements update by editors" on public.daily_achievements;
create policy "daily achievements update by editors"
on public.daily_achievements
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
    and created_by = auth.uid()
  )
);

drop policy if exists "daily achievements delete by owners" on public.daily_achievements;
create policy "daily achievements delete by owners"
on public.daily_achievements
for delete
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead')
  or (
    public.current_user_role() = 'member'
    and (user_id = auth.uid() or created_by = auth.uid())
  )
);
