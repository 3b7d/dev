export type AppRole = "admin" | "team_lead" | "member" | "viewer";

export type AuthProfile = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  roleLabel: string;
  status: "active" | "disabled";
};
