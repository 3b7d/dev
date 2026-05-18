-- DevHub phase 7: reports read access.
-- Viewer can read reporting data while operational pages remain blocked by app routing.

drop policy if exists "tasks are readable by role" on public.tasks;
create policy "tasks are readable by role"
on public.tasks
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead', 'viewer')
  or assignee_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "daily achievements are readable by role" on public.daily_achievements;
create policy "daily achievements are readable by role"
on public.daily_achievements
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead', 'viewer')
  or user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "courses are readable by role" on public.courses;
create policy "courses are readable by role"
on public.courses
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead', 'viewer')
  or user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "course notes are readable by role" on public.course_notes;
create policy "course notes are readable by role"
on public.course_notes
for select
to authenticated
using (
  public.current_user_role() in ('admin', 'team_lead', 'viewer')
  or user_id = auth.uid()
);
