import { AppShell } from "@/components/layout/app-shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data: activeProjects } = await supabase
    .from("projects")
    .select("id,name,description,progress,status,due_date")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(3);
  const { data: ongoingCourses } = await supabase
    .from("courses")
    .select("id,title,provider,progress,status")
    .eq("status", "in_progress")
    .order("updated_at", { ascending: false })
    .limit(3);

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
        ongoingCourses={(ongoingCourses ?? []).map((course) => ({
          id: course.id,
          title: course.title,
          provider: course.provider,
          progress: course.progress ?? 0,
        }))}
      />
    </AppShell>
  );
}
