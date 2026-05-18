export type ReportPeriod = "daily" | "weekly";

export type ReportFilters = {
  period: ReportPeriod;
  date: string;
  user: string;
  project: string;
};

export type ReportUserOption = {
  id: string;
  fullName: string;
  email: string;
};

export type ReportProjectOption = {
  id: string;
  name: string;
};

export type ReportTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  projectId: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type ReportAchievement = {
  id: string;
  title: string;
  achievementDate: string;
  userId: string | null;
  taskProjectId: string | null;
  blockers: string | null;
};

export type ReportCourse = {
  id: string;
  title: string;
  status: string;
  progress: number;
  userId: string | null;
  updatedAt: string;
};

export type ReportStats = {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    review: number;
    overdue: number;
    cancelled: number;
    urgent: number;
  };
  achievements: {
    total: number;
    blockers: number;
    linkedToProjects: number;
  };
  courses: {
    total: number;
    inProgress: number;
    completed: number;
    averageProgress: number;
  };
};
