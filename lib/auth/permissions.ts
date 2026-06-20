export type UserRole = 'owner' | 'admin' | 'manager' | 'consultant';
export type Action = 'manage_company' | 'manage_users' | 'manage_links' | 'manage_appointments' | 'view_reports' | 'manage_own';
const permissions: Record<UserRole, Action[]> = { owner: ['manage_company','manage_users','manage_links','manage_appointments','view_reports','manage_own'], admin: ['manage_users','manage_links','manage_appointments','view_reports','manage_own'], manager: ['view_reports','manage_appointments'], consultant: ['manage_own'] };
export function can(role: UserRole, action: Action) { return permissions[role]?.includes(action) ?? false; }
