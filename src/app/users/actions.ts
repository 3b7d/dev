"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateUserState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: CreateUserState = { status: "idle", message: "" };

export async function createManagedUser(prevState: CreateUserState = initialState, formData: FormData): Promise<CreateUserState> {
  void prevState;
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    return { status: "error", message: "غير مصرح لك بتنفيذ هذا الإجراء." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleKey = String(formData.get("role") ?? "member");
  const status = String(formData.get("status") ?? "active");

  if (!fullName || !email || !password) return { status: "error", message: "جميع الحقول مطلوبة." };
  if (password.length < 8) return { status: "error", message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." };
  if (!["admin", "member"].includes(roleKey)) return { status: "error", message: "الدور غير مدعوم." };
  if (!["active", "disabled"].includes(status)) return { status: "error", message: "حالة المستخدم غير صحيحة." };

  const admin = createAdminClient();

  const { data: roleRow, error: roleError } = await admin.from("roles").select("id,key").eq("key", roleKey).maybeSingle();
  if (roleError || !roleRow) return { status: "error", message: "تعذر قراءة الدور المحدد." };

  const { data: existing } = await admin.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) return { status: "error", message: "البريد الإلكتروني مستخدم مسبقًا." };

  const { data: authResult, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authResult.user) {
    return { status: "error", message: `فشل إنشاء حساب المصادقة: ${authError?.message ?? "خطأ غير معروف"}` };
  }

  const { error: upsertError } = await admin.from("users").upsert(
    {
      id: authResult.user.id,
      email,
      full_name: fullName,
      role_id: roleRow.id,
      status,
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    await admin.auth.admin.deleteUser(authResult.user.id);
    return { status: "error", message: `تم إنشاء المستخدم في Auth لكن فشل حفظ بياناته: ${upsertError.message}` };
  }

  revalidatePath("/users");
  return { status: "success", message: "تم إنشاء المستخدم بنجاح وربطه بقاعدة البيانات." };
}
