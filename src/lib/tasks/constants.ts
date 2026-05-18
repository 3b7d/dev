import type { AppRole } from "@/types/auth";
import type { TaskPriority, TaskStatus } from "@/types/tasks";

export const taskStatuses: Array<{
  value: TaskStatus;
  label: string;
  tone: "cyan" | "blue" | "green" | "amber" | "red" | "muted";
}> = [
  { value: "new", label: "جديدة", tone: "cyan" },
  { value: "in_progress", label: "قيد التنفيذ", tone: "blue" },
  { value: "review", label: "بانتظار مراجعة", tone: "amber" },
  { value: "completed", label: "مكتملة", tone: "green" },
  { value: "overdue", label: "متأخرة", tone: "red" },
  { value: "cancelled", label: "ملغاة", tone: "muted" },
];

export const taskPriorities: Array<{
  value: TaskPriority;
  label: string;
  tone: "cyan" | "blue" | "green" | "amber" | "red";
}> = [
  { value: "low", label: "منخفضة", tone: "green" },
  { value: "medium", label: "متوسطة", tone: "blue" },
  { value: "high", label: "عالية", tone: "amber" },
  { value: "urgent", label: "عاجلة", tone: "red" },
];

export function getTaskStatusLabel(status: TaskStatus) {
  return taskStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getTaskPriorityLabel(priority: TaskPriority) {
  return taskPriorities.find((item) => item.value === priority)?.label ?? priority;
}

export function canCreateTask(role: AppRole) {
  return role !== "viewer";
}

export function canEditAnyTask(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function canDeleteAnyTask(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function canUseTeamAssignee(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return taskStatuses.some((item) => item.value === value);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return taskPriorities.some((item) => item.value === value);
}
