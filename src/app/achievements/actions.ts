"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { canCreateAchievement, canManageAchievement, canUseTeamAchievementUser } from "@/lib/achievements/permissions";
import { createClient } from "@/lib/supabase/server";

export async function createAchievement(formData: FormData) {
  const profile = await requireProfile();

  if (!canCreateAchievement(profile.role)) {
    throw new Error("لا تملك صلاحية إضافة إنجاز.");
  }

  const payload = parseAchievementForm(formData);
  const userId = canUseTeamAchievementUser(profile.role) ? payload.userId : profile.id;
  const supabase = await createClient();

  const { error } = await supabase.from("daily_achievements").insert({
    title: payload.title,
    description: payload.description,
    achievement_date: payload.achievementDate,
    user_id: userId,
    task_id: payload.taskId,
    tomorrow_plan: payload.tomorrowPlan,
    blockers: payload.blockers,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/achievements");
}

export async function updateAchievement(formData: FormData) {
  const profile = await requireProfile();
  const achievementId = getRequiredString(formData, "achievementId");
  const payload = parseAchievementForm(formData);
  const current = await getCurrentAchievement(achievementId);

  if (!canManageAchievement(profile.role, profile.id, current.user_id, current.created_by)) {
    throw new Error("لا تملك صلاحية تعديل هذا الإنجاز.");
  }

  const userId = canUseTeamAchievementUser(profile.role) ? payload.userId : profile.id;
  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_achievements")
    .update({
      title: payload.title,
      description: payload.description,
      achievement_date: payload.achievementDate,
      user_id: userId,
      task_id: payload.taskId,
      tomorrow_plan: payload.tomorrowPlan,
      blockers: payload.blockers,
    })
    .eq("id", achievementId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/achievements");
}

export async function deleteAchievement(formData: FormData) {
  const profile = await requireProfile();
  const achievementId = getRequiredString(formData, "achievementId");
  const current = await getCurrentAchievement(achievementId);

  if (!canManageAchievement(profile.role, profile.id, current.user_id, current.created_by)) {
    throw new Error("لا تملك صلاحية حذف هذا الإنجاز.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("daily_achievements").delete().eq("id", achievementId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/achievements");
}

async function getCurrentAchievement(achievementId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_achievements")
    .select("id,user_id,created_by")
    .eq("id", achievementId)
    .single();

  if (error || !data) {
    throw new Error("الإنجاز غير موجود.");
  }

  return data as { id: string; user_id: string | null; created_by: string | null };
}

function parseAchievementForm(formData: FormData) {
  return {
    title: getRequiredString(formData, "title"),
    description: getOptionalString(formData, "description"),
    achievementDate: getRequiredString(formData, "achievementDate"),
    userId: getRequiredString(formData, "userId"),
    taskId: getOptionalString(formData, "taskId"),
    tomorrowPlan: getOptionalString(formData, "tomorrowPlan"),
    blockers: getOptionalString(formData, "blockers"),
  };
}

function getRequiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`الحقل ${key} مطلوب.`);
  }

  return value;
}

function getOptionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}
