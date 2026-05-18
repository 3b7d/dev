"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  canCreateTask,
  canDeleteAnyTask,
  canEditAnyTask,
  canUseTeamAssignee,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/tasks/constants";
import type { AppRole } from "@/types/auth";
import type { TaskPriority, TaskStatus } from "@/types/tasks";

export async function createTask(formData: FormData) {
  const profile = await requireProfile();

  if (!canCreateTask(profile.role)) {
    throw new Error("لا تملك صلاحية إضافة مهمة.");
  }

  const payload = parseTaskForm(formData);
  const supabase = await createClient();
  const assigneeId = canUseTeamAssignee(profile.role) ? payload.assigneeId : profile.id;

  const { error } = await supabase.from("tasks").insert({
    title: payload.title,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    project_id: payload.projectId,
    assignee_id: assigneeId,
    created_by: profile.id,
    due_date: payload.dueDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function updateTask(formData: FormData) {
  const profile = await requireProfile();
  const taskId = getRequiredString(formData, "taskId");
  const payload = parseTaskForm(formData);
  const supabase = await createClient();
  const currentTask = await getCurrentTask(taskId);

  if (!canMutateTask(profile.id, profile.role, currentTask)) {
    throw new Error("لا تملك صلاحية تعديل هذه المهمة.");
  }

  const assigneeId = canUseTeamAssignee(profile.role) ? payload.assigneeId : profile.id;
  const { error } = await supabase
    .from("tasks")
    .update({
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      project_id: payload.projectId,
      assignee_id: assigneeId,
      due_date: payload.dueDate,
    })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function deleteTask(formData: FormData) {
  const profile = await requireProfile();
  const taskId = getRequiredString(formData, "taskId");
  const supabase = await createClient();
  const currentTask = await getCurrentTask(taskId);

  if (!canDeleteTask(profile.id, profile.role, currentTask)) {
    throw new Error("لا تملك صلاحية حذف هذه المهمة.");
  }

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function updateTaskStatus(formData: FormData) {
  const profile = await requireProfile();
  const taskId = getRequiredString(formData, "taskId");
  const rawStatus = getRequiredString(formData, "status");

  if (!isTaskStatus(rawStatus)) {
    throw new Error("حالة المهمة غير صحيحة.");
  }

  const supabase = await createClient();
  const currentTask = await getCurrentTask(taskId);

  if (!canMutateTask(profile.id, profile.role, currentTask)) {
    throw new Error("لا تملك صلاحية تغيير حالة هذه المهمة.");
  }

  const { error } = await supabase.from("tasks").update({ status: rawStatus }).eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

async function getCurrentTask(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,created_by,assignee_id")
    .eq("id", taskId)
    .single();

  if (error || !data) {
    throw new Error("المهمة غير موجودة.");
  }

  return data as { id: string; created_by: string | null; assignee_id: string | null };
}

function parseTaskForm(formData: FormData): {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string | null;
  assigneeId: string | null;
  dueDate: string | null;
} {
  const title = getRequiredString(formData, "title");
  const description = getOptionalString(formData, "description");
  const rawStatus = getRequiredString(formData, "status");
  const rawPriority = getRequiredString(formData, "priority");

  if (!isTaskStatus(rawStatus)) {
    throw new Error("حالة المهمة غير صحيحة.");
  }

  if (!isTaskPriority(rawPriority)) {
    throw new Error("أولوية المهمة غير صحيحة.");
  }

  return {
    title,
    description,
    status: rawStatus,
    priority: rawPriority,
    projectId: getOptionalString(formData, "projectId"),
    assigneeId: getOptionalString(formData, "assigneeId"),
    dueDate: getOptionalString(formData, "dueDate"),
  };
}

function canMutateTask(
  profileId: string,
  role: AppRole,
  task: { created_by: string | null; assignee_id: string | null },
) {
  if (role === "viewer") {
    return false;
  }

  return canEditAnyTask(role) || task.created_by === profileId || task.assignee_id === profileId;
}

function canDeleteTask(
  profileId: string,
  role: AppRole,
  task: { created_by: string | null; assignee_id: string | null },
) {
  if (role === "viewer") {
    return false;
  }

  return canDeleteAnyTask(role) || task.created_by === profileId;
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
