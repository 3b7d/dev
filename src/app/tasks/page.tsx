import { AppShell } from "@/components/layout/app-shell";
import { TasksView } from "@/components/tasks/tasks-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isTaskPriority, isTaskStatus } from "@/lib/tasks/constants";
import type { TaskItem, TaskPriority, TaskProject, TaskStatus, TaskUser } from "@/types/tasks";

type TasksPageProps = {
  searchParams?: Promise<{
    status?: string;
    priority?: string;
    assignee?: string;
    view?: string;
  }>;
};

type RawTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  projects: { id: string; name: string } | { id: string; name: string }[] | null;
  assignee: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  creator: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const profile = await requireProfile();
  const params = (await searchParams) ?? {};
  const filters = {
    status: isTaskStatus(params.status) ? params.status : "all",
    priority: isTaskPriority(params.priority) ? params.priority : "all",
    assignee: params.assignee && params.assignee !== "all" ? params.assignee : "all",
    view: params.view === "kanban" ? "kanban" : "table",
  };

  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(
      "id,title,description,status,priority,due_date,created_at,updated_at,projects(id,name),assignee:users!tasks_assignee_id_fkey(id,full_name,email),creator:users!tasks_created_by_fkey(id,full_name,email)",
    )
    .order("created_at", { ascending: false });

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters.assignee !== "all") {
    query = query.eq("assignee_id", filters.assignee);
  }

  const [{ data: tasksData }, { data: usersData }, { data: projectsData }] = await Promise.all([
    query,
    supabase.from("users").select("id,full_name,email").order("full_name", { ascending: true }),
    supabase.from("projects").select("id,name").order("name", { ascending: true }),
  ]);

  const tasks = ((tasksData ?? []) as RawTask[]).map(mapTask);
  const users = ((usersData ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map(mapUser);
  const projects = ((projectsData ?? []) as Array<{ id: string; name: string }>).map((project) => ({
    id: project.id,
    name: project.name,
  }));

  return (
    <AppShell profile={profile}>
      <TasksView
        profile={profile}
        tasks={tasks}
        users={users}
        projects={projects}
        filters={filters}
      />
    </AppShell>
  );
}

function mapTask(task: RawTask): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    project: normalizeProject(task.projects),
    assignee: normalizeUser(task.assignee),
    createdBy: normalizeUser(task.creator),
  };
}

function normalizeProject(project: RawTask["projects"]): TaskProject | null {
  const value = Array.isArray(project) ? project[0] : project;
  return value ? { id: value.id, name: value.name } : null;
}

function normalizeUser(user: RawTask["assignee"]): TaskUser | null {
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
