import type { TaskPriority, TaskUser } from "@/types/tasks";

export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";

export type ProjectLink = {
  id: string;
  label: string;
  url: string;
};

export type ProjectTimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
};

export type ProjectTaskSummary = {
  total: number;
  completed: number;
  active: number;
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  owner: TaskUser | null;
  links: ProjectLink[];
  timeline: ProjectTimelineEvent[];
  tasks: ProjectTaskSummary;
};
