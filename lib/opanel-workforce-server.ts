/**
 * Backend agregasi workforce opanel: jadwal hari ini (WIB), slot shift aktif, ringkasan cabang, login 24 jam.
 * Dipakai oleh GET /api/opanel/workforce dan GET /api/opanel/dashboard-insights.
 */
import { Op } from 'sequelize';
import {
  getJakartaClock,
  parseDbTimeToMinutes,
  isNowWithinShiftWindow,
} from '@/lib/jakarta-wallclock';
import type { OpanelWorkforceInsight } from '@/types/opanel-workforce';

const WORKFORCE_NOTE =
  'Jadwal memakai tanggal & jam WIB. "Sedang bertugas" = slot jadwal hari ini yang sedang berjalan. Status login memakai waktu last login saat masuk (bukan pelacakan sesi real-time).';

export function getOpanelWorkforceEmpty(): OpanelWorkforceInsight {
  const jk = getJakartaClock();
  return {
    timezone: 'Asia/Jakarta',
    dateLocal: jk.dateLocal,
    schedulesToday: [],
    onDutyNow: [],
    byBranch: [],
    recentLogins: [],
    onlineThresholdMinutes: 30,
    note: WORKFORCE_NOTE,
  };
}

type DbModels = {
  Branch: any;
  Employee: any;
  EmployeeSchedule: any;
  User: any;
};

export async function fetchOpanelWorkforceForTenant(
  db: DbModels,
  tenantId: string,
  /** Hindari query cabang kedua bila sudah dimuat (mis. dari dashboard-insights). */
  branchesCache?: any[]
): Promise<OpanelWorkforceInsight> {
  const { Branch, Employee, EmployeeSchedule, User } = db;
  const base = getOpanelWorkforceEmpty();

  if (!tenantId) {
    return base;
  }

  const branches =
    branchesCache !== undefined
      ? branchesCache
      : await Branch.findAll({
          where: { tenantId },
          attributes: ['id', 'name', 'code'],
        });

  const branchMeta = new Map<string, { name: string; code: string }>(
    branches.map((b: any) => [String(b.id), { name: String(b.name || 'Cabang'), code: String(b.code || '') }])
  );

  try {
    let workforce: OpanelWorkforceInsight;
    const { dateLocal, minutesSinceMidnight } = getJakartaClock();

    const formatTimeShort = (t: unknown) => {
      const s = t == null ? '' : String(t);
      const m = s.match(/^(\d{1,2}):(\d{2})/);
      return m ? `${m[1].padStart(2, '0')}:${m[2]}` : s.slice(0, 5);
    };

    const mapRow = (row: any) => {
      const emp = row.employee;
      const br = emp?.branch;
      const startM = parseDbTimeToMinutes(row.startTime);
      const endM = parseDbTimeToMinutes(row.endTime);
      const onDuty =
        startM != null && endM != null && isNowWithinShiftWindow(minutesSinceMidnight, startM, endM);
      const bid = emp?.branchId ? String(emp.branchId) : null;
      const meta = bid ? branchMeta.get(bid) : undefined;
      return {
        scheduleId: row.id,
        employeeId: row.employeeId,
        employeeName: emp?.name || '—',
        position: emp?.position,
        department: emp?.department,
        employeeStatus: emp?.status,
        shiftType: row.shiftType,
        startTime: formatTimeShort(row.startTime),
        endTime: formatTimeShort(row.endTime),
        scheduleStatus: row.status,
        branchId: bid,
        branchName: meta?.name || br?.name || (bid ? 'Cabang' : 'Belum ditetapkan cabang'),
        branchCode: meta?.code || br?.code,
        onDutyNow: onDuty,
      };
    };

    if (EmployeeSchedule) {
      const schedRows = await EmployeeSchedule.findAll({
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'name', 'position', 'branchId', 'department', 'status'],
            where: { tenantId },
            required: true,
            include: [
              {
                model: Branch,
                as: 'branch',
                attributes: ['id', 'name', 'code'],
                required: false,
              },
            ],
          },
        ],
        where: {
          scheduleDate: dateLocal,
          status: { [Op.in]: ['scheduled', 'confirmed'] },
        },
        attributes: ['id', 'employeeId', 'scheduleDate', 'shiftType', 'startTime', 'endTime', 'status'],
        order: [['startTime', 'ASC']],
        limit: 400,
      });

      const schedulesToday = schedRows.map(mapRow);
      const onDutyNow = schedulesToday.filter((x: { onDutyNow: boolean }) => x.onDutyNow);

      const agg = new Map<
        string,
        {
          branchId: string | null;
          branchName: string;
          branchCode?: string;
          scheduledToday: number;
          onDutyNow: number;
        }
      >();

      const ensureAgg = (
        key: string,
        branchId: string | null,
        branchName: string,
        branchCode?: string
      ) => {
        if (!agg.has(key)) {
          agg.set(key, {
            branchId,
            branchName,
            branchCode,
            scheduledToday: 0,
            onDutyNow: 0,
          });
        }
        return agg.get(key)!;
      };

      for (const s of schedulesToday) {
        const key = s.branchId || '__none__';
        const label = s.branchId ? s.branchName : 'Belum ditetapkan cabang';
        const row = ensureAgg(key, s.branchId, label, s.branchCode);
        row.scheduledToday += 1;
        if (s.onDutyNow) row.onDutyNow += 1;
      }

      for (const [bid, meta] of branchMeta.entries()) {
        if (!agg.has(bid)) {
          agg.set(bid, {
            branchId: bid,
            branchName: meta.name,
            branchCode: meta.code,
            scheduledToday: 0,
            onDutyNow: 0,
          });
        }
      }

      workforce = {
        ...base,
        dateLocal,
        schedulesToday,
        onDutyNow,
        byBranch: Array.from(agg.values()).sort((a, b) =>
          (a.branchName || '').localeCompare(b.branchName || '', 'id')
        ),
        onlineThresholdMinutes: base.onlineThresholdMinutes,
        note: base.note,
      };
    } else {
      workforce = { ...base, dateLocal };
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (User) {
      const recentUsers = await User.findAll({
        where: {
          tenantId,
          isActive: true,
          lastLogin: { [Op.and]: [{ [Op.ne]: null }, { [Op.gte]: since24h }] },
        },
        include: [
          {
            model: Branch,
            as: 'assignedBranch',
            attributes: ['id', 'name', 'code'],
            required: false,
          },
        ],
        attributes: ['id', 'name', 'email', 'role', 'lastLogin', 'assignedBranchId'],
        order: [['lastLogin', 'DESC']],
        limit: 50,
      });

      workforce.recentLogins = recentUsers.map((u: any) => {
        const ll = u.lastLogin ? new Date(u.lastLogin) : null;
        const minsAgo = ll ? Math.round((Date.now() - ll.getTime()) / 60000) : null;
        const thr = workforce.onlineThresholdMinutes ?? 30;
        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          lastLogin: ll?.toISOString() || null,
          lastLoginLabel: ll
            ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(ll)
            : null,
          minutesSinceLogin: minsAgo,
          likelyActiveOnline: minsAgo != null && minsAgo <= thr,
          branchId: u.assignedBranchId ? String(u.assignedBranchId) : null,
          branchName: u.assignedBranch?.name || (u.assignedBranchId ? 'Cabang' : 'Tidak terikat cabang'),
          branchCode: u.assignedBranch?.code,
        };
      });
    }

    return workforce;
  } catch (e) {
    console.warn('[opanel-workforce-server]', e);
    return getOpanelWorkforceEmpty();
  }
}
