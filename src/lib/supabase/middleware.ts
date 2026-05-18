import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canAccessPath, getHomeRouteForRole } from "@/config/permissions";
import type { AppRole } from "@/types/auth";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const role = await getRoleForUser(user.id, supabase);
    const url = request.nextUrl.clone();
    url.pathname = getHomeRouteForRole(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && !isAuthRoute) {
    const role = await getRoleForUser(user.id, supabase);

    if (!canAccessPath(role, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

async function getRoleForUser(
  userId: string,
  supabase: SupabaseClient,
): Promise<AppRole> {
  const { data } = await supabase
    .from("users")
    .select("roles!inner(key)")
    .eq("id", userId)
    .maybeSingle();

  const role = getRoleFromProfile(data);
  return isAppRole(role) ? role : "member";
}

function getRoleFromProfile(profile: unknown) {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const roles = "roles" in profile ? profile.roles : undefined;
  return Array.isArray(roles)
    ? roles[0]?.key
    : roles && typeof roles === "object" && "key" in roles
      ? roles.key
      : null;
}

function isAppRole(role: unknown): role is AppRole {
  return role === "admin" || role === "team_lead" || role === "member" || role === "viewer";
}
