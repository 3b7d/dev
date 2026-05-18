import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/components/reports/reports-view";
import { requireProfile } from "@/lib/auth/session";
import { getReportDateRange, getTodayDate } from "@/lib/reports/date-range";
import { createClient } from "@/lib/supabase/server";
import type {
  ReportAchievement,
  ReportCourse,
  ReportFilters,
  ReportProjectOption,
  ReportStats,
  ReportTask,
  ReportUserOption,
} from "@/types/reports";

type ReportsPageProps = {
  searchParams?: Promise<{
    period?: string;
    date?: string;
    user?: string;
    project?: string;
  }>;
};

type RawTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  project_id: string | null;
  created_at: string;
  completed_at: string | null;
};

type RawAchievement = {
  id: string;
  title: string;
  achievement_date: string;
  user_id: string | null;
  blockers: string | null;
  tasks: { project_id: string | null } | { project_id: string | null }[] | null;
};

type RawCourse = {
  id: string;
  title: string;
  status: string;
  progress: number;
  user_id: string | null;
  updated_at: string;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const profile = await requireProfile();
  const params = (await searchParams) ?? {};

  const selectedDate: string = isDateValue(params.date) && params.date ? params.date : getTodayDate();
  const selectedUser: string = params.user && params.user !== "all" ? params.user : "all";
  const selectedProject: string = params.project && params.project !== "all" ? params.project : "all";
  const selectedPeriod: ReportPeriod = params.period === "weekly" ? "weekly" : "daily";

  const filters: ReportFilters = {
    period: selectedPeriod,
    date: selectedDate,
    user: selectedUser,
    project: selectedProject,
  };

  const range = getReportDateRange(filters.period, filters.date);
  const supabase = await createClient();

  const [{ data: tasksData }, { data: achievementsData }, { data: coursesData }, { data: usersData }, { data: projectsData }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id,title,status,priority,assignee_id,project_id,created_at,completed_at")
        .gte("created_at", `${range.from}T00:00:00.000Z`)
        .lte("created_at", `${range.to}T23:59:59.999Z`),
      supabase
        .from("daily_achievements")
        .select("id,title,achievement_date,user_id,blockers,tasks(project_id)")
        .gte("achievement_date", range.from)
        .lte("achievement_date", range.to),
      supabase
        .from("courses")
        .select("id,title,status,progress,user_id,updated_at")
        .gte("updated_at", `${range.from}T00:00:00.000Z`)
        .lte("updated_at", `${range.to}T23:59:59.999Z`),
      supabase.from("users").select("id,full_name,email").order("full_name", { ascending: true }),
      supabase.from("projects").select("id,name").order("name", { ascending: true }),
    ]);

  let tasks = ((tasksData ?? []) as RawTask[]).map(mapTask);
  let achievements = ((achievementsData ?? []) as RawAchievement[]).map(mapAchievement);
  let courses = ((coursesData ?? []) as RawCourse[]).map(mapCourse);

  if (filters.user !== "all") {
    tasks = tasks.filter((task) => task.assigneeId === filters.user);
    achievements = achievements.filter((achievement) => achievement.userId === filters.user);
    courses = courses.filter((course) => course.userId === filters.user);
  }

  if (filters.project !== "all") {
    tasks = tasks.filter((task) => task.projectId === filters.project);
    achievements = achievements.filter((achievement) => achievement.taskProjectId === filters.project);
  }

  const users = ((usersData ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map(
    (user): ReportUserOption => ({
      id: user.id,
      fullName: user.full_name ?? user.email,
      email: user.email,
    }),
  );

  const projects = ((projectsData ?? []) as Array<{ id: string; name: string }>).map(
    (project): ReportProjectOption => ({
      id: project.id,
      name: project.name,
    }),
  );

  return (
    <AppShell profile={profile}>
      <ReportsView
        profile={profile}
        filters={filters}
        range={range}
        users={users}
        projects={projects}
        tasks={tasks}
        achievements={achievements}
        courses={courses}
        stats={buildStats(tasks, achievements, courses)}
      />
    </AppShell>
  );
}

function mapTask(task: RawTask): ReportTask {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id,
    projectId: task.project_id,
    createdAt: task.created_at,
    completedAt: task.completed_at,
  };
}

function mapAchievement(item: RawAchievement): ReportAchievement {
  const task = Array.isArray(item.tasks) ? item.tasks[0] : item.tasks;

  return {
    id: item.id,
    title: item.title,
    achievementDate: item.achievement_date,
    userId: item.user_id,
    blockers: item.blockers,
    taskProjectId: task?.project_id ?? null,
  };
}

function mapCourse(course: RawCourse): ReportCourse {
  return {
    id: course.id,
    title: course.title,
    status: course.status,
    progress: course.progress,
    userId: course.user_id,
    updatedAt: course.updated_at,
  };
}

function buildStats(tasks: ReportTask[], achievements: ReportAchievement[], courses: ReportCourse[]): ReportStats {
  return {
    tasks: {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "completed").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      review: tasks.filter((task) => task.status === "review").length,
      overdue: tasks.filter((task) => task.status === "overdue").length,
      cancelled: tasks.filter((task) => task.status === "cancelled").length,
      urgent: tasks.filter((task) => task.priority === "urgent").length,
    },
    achievements: {
      total: achievements.length,
      blockers: achievements.filter((achievement) => achievement.blockers).length,
      linkedToProjects: achievements.filter((achievement) => achievement.taskProjectId).length,
    },
    courses: {
      total: courses.length,
      inProgress: courses.filter((course) => course.status === "in_progress").length,
      completed: courses.filter((course) => course.status === "completed").length,
      averageProgress: courses.length
        ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
        : 0,
    },
  };
}

function isDateValue(value: string | undefined): boolean {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
