import type { AppRole } from "@/types/auth";
import type { ProjectStatus } from "@/types/projects";
import type { TaskPriority } from "@/types/tasks";

export const projectStatuses: Array<{
  value: ProjectStatus;
  label: string;
  tone: "cyan" | "blue" | "green" | "amber" | "red" | "muted";
}> = [
  { value: "active", label: "نشط", tone: "cyan" },
  { value: "paused", label: "متوقف مؤقتًا", tone: "amber" },
  { value: "completed", label: "مكتمل", tone: "green" },
  { value: "cancelled", label: "ملغى", tone: "muted" },
];

export const projectPriorities: Array<{
  value: TaskPriority;
  label: string;
  tone: "blue" | "green" | "amber" | "red";
}> = [
  { value: "low", label: "منخفضة", tone: "green" },
  { value: "medium", label: "متوسطة", tone: "blue" },
  { value: "high", label: "عالية", tone: "amber" },
  { value: "urgent", label: "عاجلة", tone: "red" },
];

export function getProjectStatusLabel(status: ProjectStatus) {
  return projectStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getProjectPriorityLabel(priority: TaskPriority) {
  return projectPriorities.find((item) => item.value === priority)?.label ?? priority;
}

export function canManageProjects(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return projectStatuses.some((item) => item.value === value);
}

export function isProjectPriority(value: unknown): value is TaskPriority {
  return projectPriorities.some((item) => item.value === value);
}
