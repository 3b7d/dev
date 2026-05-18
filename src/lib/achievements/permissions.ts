import type { AppRole } from "@/types/auth";

export function canCreateAchievement(role: AppRole) {
  return role !== "viewer";
}

export function canUseTeamAchievementUser(role: AppRole) {
  return role === "admin" || role === "team_lead";
}

export function canManageAchievement(role: AppRole, profileId: string, ownerId?: string | null, createdById?: string | null) {
  if (role === "admin" || role === "team_lead") {
    return true;
  }

  if (role === "viewer") {
    return false;
  }

  return ownerId === profileId || createdById === profileId;
}
