import { AppShell } from "@/components/layout/app-shell";
import { ProjectsView } from "@/components/projects/projects-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ProjectItem, ProjectLink, ProjectStatus, ProjectTimelineEvent } from "@/types/projects";
import type { TaskPriority, TaskStatus, TaskUser } from "@/types/tasks";

type RawProject = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  owner: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  project_links: ProjectLink[] | null;
  project_timeline_events: Array<{ id: string; title: string; description: string | null; event_date: string }> | null;
  tasks: Array<{ id: string; status: TaskStatus }> | null;
};

export default async function ProjectsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: projectsData }, { data: usersData }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,name,description,status,priority,progress,start_date,due_date,created_at,updated_at,owner:users!projects_owner_id_fkey(id,full_name,email),project_links(id,label,url),project_timeline_events(id,title,description,event_date),tasks(id,status)",
      )
      .order("updated_at", { ascending: false }),
    supabase.from("users").select("id,full_name,email").order("full_name", { ascending: true }),
  ]);

  const projects = ((projectsData ?? []) as RawProject[]).map(mapProject);
  const users = ((usersData ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map(mapUser);

  return (
    <AppShell profile={profile}>
      <ProjectsView profile={profile} projects={projects} users={users} />
    </AppShell>
  );
}

function mapProject(project: RawProject): ProjectItem {
  const tasks = project.tasks ?? [];

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    startDate: project.start_date,
    dueDate: project.due_date,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    owner: normalizeUser(project.owner),
    links: project.project_links ?? [],
    timeline: (project.project_timeline_events ?? [])
      .map((event): ProjectTimelineEvent => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.event_date,
      }))
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    tasks: {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "completed").length,
      active: tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled").length,
    },
  };
}

function normalizeUser(user: RawProject["owner"]): TaskUser | null {
  const value = Array.isArray(user) ? user[0] : user;
  return value ? mapUser(value) : null;
}

function mapUser(user: { id: string; full_name: string | null; email: string }): TaskUser {
  return {
    id: user.id,
    fullName: user.full_name ?? user.email,
    email: user.email,
  };
}
