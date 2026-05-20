import type { AppRole } from "@/types/auth";

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  team_lead: "Team Lead",
  member: "Member",
  viewer: "Viewer",
};

export const roleHomeRoutes: Record<AppRole, string> = {
  admin: "/",
  team_lead: "/",
  member: "/",
  viewer: "/",
};

export const protectedRoutes: Array<{
  prefix: string;
  roles: AppRole[];
}> = [
  {
    prefix: "/tasks",
    roles: ["admin", "team_lead", "member"],
  },
  {
    prefix: "/achievements",
    roles: ["admin", "team_lead", "member"],
  },
  {
    prefix: "/projects",
    roles: ["admin", "team_lead", "member"],
  },
  {
    prefix: "/courses",
    roles: ["admin", "team_lead", "member"],
  },
  {
    prefix: "/users",
    roles: ["admin"],
  },
  {
    prefix: "/",
    roles: ["admin", "team_lead", "member", "viewer"],
  },
];

export function getHomeRouteForRole(role: AppRole) {
  return roleHomeRoutes[role] ?? "/";
}

export function canAccessPath(role: AppRole, pathname: string) {
  const route = protectedRoutes
    .filter((item) => item.prefix === "/" || pathname === item.prefix || pathname.startsWith(`${item.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  if (!route) {
    return true;
  }

  return route.roles.includes(role);
}
