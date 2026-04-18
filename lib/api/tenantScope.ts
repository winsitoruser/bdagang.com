import type { Session } from 'next-auth';
import { Op } from 'sequelize';

type SessionUser = Session['user'] & { tenantId?: string | null; branchId?: string | null };

export function getTenantId(session: Session | null): string | null {
  const id = (session?.user as SessionUser | undefined)?.tenantId;
  return id != null && id !== '' ? String(id) : null;
}

export function getBranchId(session: Session | null): string | null {
  const id = (session?.user as SessionUser | undefined)?.branchId;
  return id != null && id !== '' ? String(id) : null;
}

/** Tenant wajib; jika user punya cabang, sertakan baris cabang itu + baris tanpa cabang (global tenant). */
export function tableReservationWhere(
  tenantId: string,
  branchId: string | null | undefined
): Record<string, unknown> {
  if (!branchId) {
    return { tenantId };
  }
  return {
    tenantId,
    [Op.or]: [{ branchId }, { branchId: null }]
  };
}
