import { redirect } from "next/navigation";
import { roleLabels } from "@/config/permissions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, AuthProfile } from "@/types/auth";

export async function requireProfile(): Promise<AuthProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id,email,full_name,status,roles!inner(key,name)")
    .eq("id", user.id)
    .maybeSingle();

  const role = getRoleFromProfile(profile);
  const status = profile?.status === "disabled" ? "disabled" : "active";

  if (status === "disabled") {
    await supabase.auth.signOut();
    redirect("/login?error=disabled");
  }

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? "مستخدم DevHub",
    role,
    roleLabel: roleLabels[role],
    status,
  };
}

function getRoleFromProfile(profile: unknown): AppRole {
  if (!profile || typeof profile !== "object") {
    return "member";
  }

  const roles = "roles" in profile ? profile.roles : undefined;
  const role = Array.isArray(roles)
    ? roles[0]?.key
    : roles && typeof roles === "object" && "key" in roles
      ? roles.key
      : null;

  return isAppRole(role) ? role : "member";
}

function isAppRole(role: unknown): role is AppRole {
  return role === "admin" || role === "team_lead" || role === "member" || role === "viewer";
}
