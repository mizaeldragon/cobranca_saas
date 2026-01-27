export type Role = "OWNER" | "ADMIN" | "FINANCE" | "VIEWER" | string;

function norm(role: Role): Role {
  return String(role).toUpperCase() as Role;
}

export function canManageData(role: Role) {
  const r = norm(role);
  return r === "OWNER" || r === "ADMIN" || r === "FINANCE";
}

export function canViewReports(role: Role) {
  const r = norm(role);
  return r === "OWNER" || r === "ADMIN" || r === "FINANCE";
}

export function canManageCompany(role: Role) {
  const r = norm(role);
  return r === "OWNER" || r === "ADMIN";
}

export function canManageUsers(role: Role) {
  const r = norm(role);
  return r === "OWNER" || r === "ADMIN";
}

