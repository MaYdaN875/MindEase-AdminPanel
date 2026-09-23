export const hasStaffRole = (roles: string[]) => roles.some(role => ['ADMIN', 'SUPERADMIN', 'REVISOR', 'MODERATOR', 'SUPPORT'].includes(role));
export function canAccess(roles: string[], view: string): boolean {
  const allowed: Record<string, string[]> = {
    dashboard: ['ADMIN', 'SUPERADMIN', 'REVISOR'],
    requests: ['ADMIN', 'SUPERADMIN', 'REVISOR'],
    dossier: ['ADMIN', 'SUPERADMIN', 'REVISOR'],
    users: ['ADMIN', 'SUPERADMIN'],
    audit: ['ADMIN', 'SUPERADMIN'],
    catalogs: ['ADMIN', 'SUPERADMIN'],
    moderation: ['ADMIN', 'SUPERADMIN', 'MODERATOR', 'SUPPORT'],
    community: ['ADMIN', 'SUPERADMIN', 'MODERATOR'],
    support: ['ADMIN', 'SUPERADMIN', 'SUPPORT'],
    broadcast: ['ADMIN', 'SUPERADMIN'],
  };
  return (allowed[view] ?? []).some(role => roles.includes(role));
}
