import type { TaskUser } from "@/types/tasks";

export type CourseStatus = "planned" | "in_progress" | "completed" | "paused";

export type CourseNote = {
  id: string;
  title: string;
  summary: string;
  lessonDate: string;
  user: TaskUser | null;
};

export type CourseItem = {
  id: string;
  title: string;
  provider: string | null;
  url: string | null;
  status: CourseStatus;
  progress: number;
  startDate: string | null;
  completedAt: string | null;
  certificateUrl: string | null;
  certificatePath: string | null;
  signedCertificateUrl: string | null;
  user: TaskUser | null;
  createdBy: TaskUser | null;
  notes: CourseNote[];
  createdAt: string;
  updatedAt: string;
};
