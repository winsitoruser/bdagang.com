import { Op } from 'sequelize';
import type { Session } from 'next-auth';

/**
 * Kriteria Sequelize untuk mencari User dari session (id lebih andal dari email).
 */
export function userWhereFromSession(session: Session | null): Record<string, unknown> | null {
  if (!session?.user) return null;
  const id = session.user.id;
  if (id != null && String(id).length > 0) {
    const n = parseInt(String(id), 10);
    if (!Number.isNaN(n)) {
      return { id: n };
    }
  }
  const email = session.user.email;
  if (email != null && String(email).trim().length > 0) {
    return { email: { [Op.iLike]: String(email).trim() } };
  }
  return null;
}
