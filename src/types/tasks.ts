export type TaskStatus = "new" | "in_progress" | "review" | "completed" | "overdue" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskUser = {
  id: string;
  fullName: string;
  email: string;
};

export type TaskProject = {
  id: string;
  name: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project: TaskProject | null;
  assignee: TaskUser | null;
  createdBy: TaskUser | null;
};
