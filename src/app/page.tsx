import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type RawDashboardTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
};

export default async function HomePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: activeProjects }, { count: activeProjectsCount }] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,description,progress,status,due_date")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const { data: ongoingCourses } = await supabase
    .from("courses")
    .select("id,title,provider,progress,status")
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(3);

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("id,title,status,priority,due_date,created_at")
    .order("created_at", { ascending: false });

  return (
    <AppShell profile={profile}>
      <DashboardView
        activeProjects={(activeProjects ?? []).map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          progress: project.progress ?? 0,
          dueDate: project.due_date,
        }))}
        activeProjectsCount={activeProjectsCount ?? 0}
        ongoingCourses={(ongoingCourses ?? []).map((course) => ({
          id: course.id,
          title: course.title,
          provider: course.provider,
          progress: course.progress ?? 0,
        }))}
        tasks={(tasksData ?? []) as RawDashboardTask[]}
      />
    </AppShell>
  );
}
