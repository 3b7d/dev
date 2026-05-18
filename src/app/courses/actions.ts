"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import {
  canCreateCourse,
  canManageCourse,
  canUseTeamCourseUser,
  isCourseStatus,
} from "@/lib/courses/constants";
import { createClient } from "@/lib/supabase/server";

const CERTIFICATE_BUCKET = "course-certificates";

export async function createCourse(formData: FormData) {
  const profile = await requireProfile();

  if (!canCreateCourse(profile.role)) {
    throw new Error("لا تملك صلاحية إضافة دورة.");
  }

  const payload = parseCourseForm(formData);
  const userId = canUseTeamCourseUser(profile.role) ? payload.userId : profile.id;
  const supabase = await createClient();

  const { error } = await supabase.from("courses").insert({
    title: payload.title,
    provider: payload.provider,
    url: payload.url,
    status: payload.status,
    progress: payload.progress,
    user_id: userId,
    start_date: payload.startDate,
    completed_at: payload.completedAt,
    certificate_url: payload.certificateUrl,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
  revalidatePath("/");
}

export async function updateCourseProgress(formData: FormData) {
  const profile = await requireProfile();
  const courseId = getRequiredString(formData, "courseId");
  const progress = parseProgress(getRequiredString(formData, "progress"));
  const status = getRequiredString(formData, "status");

  if (!isCourseStatus(status)) {
    throw new Error("حالة الدورة غير صحيحة.");
  }

  const current = await getCurrentCourse(courseId);

  if (!canManageCourse(profile.role, profile.id, current.user_id, current.created_by)) {
    throw new Error("لا تملك صلاحية تحديث هذه الدورة.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      progress,
      status,
      completed_at: status === "completed" ? new Date().toLocaleDateString("en-CA") : null,
    })
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
  revalidatePath("/");
}

export async function addCourseNote(formData: FormData) {
  const profile = await requireProfile();
  const courseId = getRequiredString(formData, "courseId");
  const current = await getCurrentCourse(courseId);

  if (!canManageCourse(profile.role, profile.id, current.user_id, current.created_by)) {
    throw new Error("لا تملك صلاحية إضافة ملخص لهذه الدورة.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("course_notes").insert({
    course_id: courseId,
    user_id: current.user_id ?? profile.id,
    title: getRequiredString(formData, "title"),
    summary: getRequiredString(formData, "summary"),
    lesson_date: getRequiredString(formData, "lessonDate"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
}

export async function updateCourseCertificate(formData: FormData) {
  const profile = await requireProfile();
  const courseId = getRequiredString(formData, "courseId");
  const current = await getCurrentCourse(courseId);

  if (!canManageCourse(profile.role, profile.id, current.user_id, current.created_by)) {
    throw new Error("لا تملك صلاحية تحديث شهادة هذه الدورة.");
  }

  const certificateUrl = getOptionalString(formData, "certificateUrl");
  const file = formData.get("certificateFile");
  let certificatePath: string | null = null;

  if (file instanceof File && file.size > 0) {
    certificatePath = await uploadCertificate(profile.id, courseId, file);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      certificate_url: certificateUrl,
      certificate_path: certificatePath ?? current.certificate_path,
    })
    .eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
}

async function uploadCertificate(profileId: string, courseId: string, file: File) {
  const supabase = await createClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "bin";
  const safeExtension = extension?.replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${profileId}/${courseId}/${crypto.randomUUID()}.${safeExtension}`;
  const { error } = await supabase.storage.from(CERTIFICATE_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function getCurrentCourse(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id,user_id,created_by,certificate_path")
    .eq("id", courseId)
    .single();

  if (error || !data) {
    throw new Error("الدورة غير موجودة.");
  }

  return data as { id: string; user_id: string | null; created_by: string | null; certificate_path: string | null };
}

function parseCourseForm(formData: FormData) {
  const status = getRequiredString(formData, "status");

  if (!isCourseStatus(status)) {
    throw new Error("حالة الدورة غير صحيحة.");
  }

  return {
    title: getRequiredString(formData, "title"),
    provider: getOptionalString(formData, "provider"),
    url: getOptionalString(formData, "url"),
    status,
    progress: parseProgress(getRequiredString(formData, "progress")),
    userId: getRequiredString(formData, "userId"),
    startDate: getOptionalString(formData, "startDate"),
    completedAt: getOptionalString(formData, "completedAt"),
    certificateUrl: getOptionalString(formData, "certificateUrl"),
  };
}

function parseProgress(value: string) {
  const progress = Number(value);

  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new Error("نسبة التقدم يجب أن تكون بين 0 و 100.");
  }

  return progress;
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
