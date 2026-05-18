import type { TaskItem, TaskUser } from "@/types/tasks";

export type DailyAchievement = {
  id: string;
  title: string;
  description: string | null;
  achievementDate: string;
  tomorrowPlan: string | null;
  blockers: string | null;
  createdAt: string;
  user: TaskUser | null;
  task: Pick<TaskItem, "id" | "title" | "status" | "priority"> | null;
  createdBy: TaskUser | null;
};
