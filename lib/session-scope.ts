/**
 * Branch / tenant helpers for API handlers (NextAuth JWT session).
 */

export function getSessionTenantId(session: { user?: unknown } | null): string | null {
  const u = session?.user as { tenantId?: string } | undefined;
  return u?.tenantId != null && u.tenantId !== '' ? String(u.tenantId) : null;
}

export function getSessionBranchId(session: { user?: unknown } | null): string | null {
  const u = session?.user as { branchId?: string; assignedBranchId?: string } | undefined;
  const b = u?.branchId ?? u?.assignedBranchId;
  return b != null && b !== '' ? String(b) : null;
}

export function getSessionDataScope(session: { user?: unknown } | null): string {
  const u = session?.user as { dataScope?: string } | undefined;
  return u?.dataScope || 'own_branch';
}
