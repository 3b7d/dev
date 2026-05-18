import type { AppRole } from "@/types/auth";
import type { CourseStatus } from "@/types/courses";

export const courseStatuses: Array<{
  value: CourseStatus;
  label: string;
  tone: "cyan" | "blue" | "green" | "amber";
}> = [
  { value: "planned", label: "مخططة", tone: "blue" },
  { value: "in_progress", label: "جارية", tone: "cyan" },
  { value: "completed", label: "مكتملة", tone: "green" },
  { value: "paused", label: "متوقفة", tone: "amber" },
];

export function getCourseStatusLabel(status: CourseStatus) {
  return courseStatuses.find((item) => item.value === status)?.label ?? status;
}

export function isCourseStatus(value: unknown): value is CourseStatus {
  return courseStatuses.some((item) => item.value === value);
}

export function canCreateCourse(role: AppRole) {
  return role !== "viewer";
}

export function canUseTeamCourseUser(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function canManageCourse(role: AppRole, profileId: string, userId?: string | null, createdById?: string | null) {
  if (role === "admin" || role === "team_lead") {
    return true;
  }

  if (role === "viewer") {
    return false;
  }

  return userId === profileId || createdById === profileId;
}
