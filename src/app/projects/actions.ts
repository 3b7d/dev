"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { canManageProjects, isProjectPriority, isProjectStatus } from "@/lib/projects/constants";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const profile = await requireProjectManager();
  const payload = parseProjectForm(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("projects").insert({
    name: payload.name,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    progress: payload.progress,
    owner_id: payload.ownerId,
    start_date: payload.startDate,
    due_date: payload.dueDate,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateProject(formData: FormData) {
  await requireProjectManager();
  const projectId = getRequiredString(formData, "projectId");
  const payload = parseProjectForm(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({
      name: payload.name,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      progress: payload.progress,
      owner_id: payload.ownerId,
      start_date: payload.startDate,
      due_date: payload.dueDate,
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function deleteProject(formData: FormData) {
  await requireProjectManager();
  const projectId = getRequiredString(formData, "projectId");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function addProjectLink(formData: FormData) {
  const profile = await requireProjectManager();
  const projectId = getRequiredString(formData, "projectId");
  const label = getRequiredString(formData, "label");
  const url = getRequiredString(formData, "url");

  validateUrl(url);

  const supabase = await createClient();
  const { error } = await supabase.from("project_links").insert({
    project_id: projectId,
    label,
    url,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
}

export async function deleteProjectLink(formData: FormData) {
  await requireProjectManager();
  const linkId = getRequiredString(formData, "linkId");
  const supabase = await createClient();
  const { error } = await supabase.from("project_links").delete().eq("id", linkId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
}

export async function addTimelineEvent(formData: FormData) {
  const profile = await requireProjectManager();
  const projectId = getRequiredString(formData, "projectId");
  const title = getRequiredString(formData, "title");
  const description = getOptionalString(formData, "description");
  const eventDate = getRequiredString(formData, "eventDate");
  const supabase = await createClient();

  const { error } = await supabase.from("project_timeline_events").insert({
    project_id: projectId,
    title,
    description,
    event_date: eventDate,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
}

export async function deleteTimelineEvent(formData: FormData) {
  await requireProjectManager();
  const eventId = getRequiredString(formData, "eventId");
  const supabase = await createClient();
  const { error } = await supabase.from("project_timeline_events").delete().eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
}

async function requireProjectManager() {
  const profile = await requireProfile();

  if (!canManageProjects(profile.role)) {
    throw new Error("لا تملك صلاحية إدارة المشاريع.");
  }

  return profile;
}

function parseProjectForm(formData: FormData) {
  const status = getRequiredString(formData, "status");
  const priority = getRequiredString(formData, "priority");
  const rawProgress = Number(getRequiredString(formData, "progress"));

  if (!isProjectStatus(status)) {
    throw new Error("حالة المشروع غير صحيحة.");
  }

  if (!isProjectPriority(priority)) {
    throw new Error("أولوية المشروع غير صحيحة.");
  }

  if (!Number.isFinite(rawProgress) || rawProgress < 0 || rawProgress > 100) {
    throw new Error("نسبة الإنجاز يجب أن تكون بين 0 و 100.");
  }

  return {
    name: getRequiredString(formData, "name"),
    description: getOptionalString(formData, "description"),
    status,
    priority,
    progress: rawProgress,
    ownerId: getOptionalString(formData, "ownerId"),
    startDate: getOptionalString(formData, "startDate"),
    dueDate: getOptionalString(formData, "dueDate"),
  };
}

function validateUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid protocol.");
    }
  } catch {
    throw new Error("رابط المشروع غير صحيح.");
  }
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
