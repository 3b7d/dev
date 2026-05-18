import { AppShell } from "@/components/layout/app-shell";
import { AchievementsView } from "@/components/achievements/achievements-view";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { DailyAchievement } from "@/types/achievements";
import type { TaskItem, TaskPriority, TaskStatus, TaskUser } from "@/types/tasks";

type AchievementsPageProps = {
  searchParams?: Promise<{
    date?: string;
    user?: string;
  }>;
};

type RawAchievement = {
  id: string;
  title: string;
  description: string | null;
  achievement_date: string;
  tomorrow_plan: string | null;
  blockers: string | null;
  created_at: string;
  user: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
  tasks: { id: string; title: string; status: TaskStatus; priority: TaskPriority } | { id: string; title: string; status: TaskStatus; priority: TaskPriority }[] | null;
  creator: { id: string; full_name: string | null; email: string } | { id: string; full_name: string | null; email: string }[] | null;
};

export default async function AchievementsPage({ searchParams }: AchievementsPageProps) {
  const profile = await requireProfile();
  const params = (await searchParams) ?? {};
  const selectedDate = isDateValue(params.date) ? params.date : getTodayDate();
  const selectedUser = params.user && params.user !== "all" ? params.user : "all";
  const supabase = await createClient();

  let achievementsQuery = supabase
    .from("daily_achievements")
    .select(
      "id,title,description,achievement_date,tomorrow_plan,blockers,created_at,user:users!daily_achievements_user_id_fkey(id,full_name,email),tasks(id,title,status,priority),creator:users!daily_achievements_created_by_fkey(id,full_name,email)",
    )
    .eq("achievement_date", selectedDate)
    .order("created_at", { ascending: false });

  if (selectedUser !== "all") {
    achievementsQuery = achievementsQuery.eq("user_id", selectedUser);
  }

  const [{ data: achievementsData }, { data: usersData }, { data: tasksData }] = await Promise.all([
    achievementsQuery,
    supabase.from("users").select("id,full_name,email").order("full_name", { ascending: true }),
    supabase
      .from("tasks")
      .select("id,title,status,priority")
      .eq("status", "completed")
      .order("updated_at", { ascending: false }),
  ]);

  const users = ((usersData ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map(mapUser);
  const completedTasks = ((tasksData ?? []) as Array<{ id: string; title: string; status: TaskStatus; priority: TaskPriority }>).map(
    (task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
    }),
  );
  const achievements = ((achievementsData ?? []) as RawAchievement[]).map(mapAchievement);

  return (
    <AppShell profile={profile}>
      <AchievementsView
        profile={profile}
        achievements={achievements}
        users={users}
        completedTasks={completedTasks}
        selectedDate={selectedDate}
        selectedUser={selectedUser}
      />
    </AppShell>
  );
}

function mapAchievement(item: RawAchievement): DailyAchievement {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    achievementDate: item.achievement_date,
    tomorrowPlan: item.tomorrow_plan,
    blockers: item.blockers,
    createdAt: item.created_at,
    user: normalizeUser(item.user),
    task: normalizeTask(item.tasks),
    createdBy: normalizeUser(item.creator),
  };
}

function normalizeUser(user: RawAchievement["user"]): TaskUser | null {
  const value = Array.isArray(user) ? user[0] : user;
  return value ? mapUser(value) : null;
}

function normalizeTask(task: RawAchievement["tasks"]): DailyAchievement["task"] {
  const value = Array.isArray(task) ? task[0] : task;
  return value
    ? {
        id: value.id,
        title: value.title,
        status: value.status,
        priority: value.priority,
      }
    : null;
}

function mapUser(user: { id: string; full_name: string | null; email: string }): TaskUser {
  return {
    id: user.id,
    fullName: user.full_name ?? user.email,
    email: user.email,
  };
}

function getTodayDate() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

function isDateValue(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
