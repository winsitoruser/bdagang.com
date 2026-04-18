import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Users,
  LogIn,
  Building2,
  ArrowRight,
  Radio,
  Briefcase,
  LayoutGrid,
  Table2,
} from 'lucide-react';

import type {
  OpanelWorkforceScheduleRow,
  OpanelWorkforceLoginRow,
  OpanelWorkforceInsight,
} from '@/types/opanel-workforce';

export type {
  OpanelWorkforceScheduleRow,
  OpanelWorkforceLoginRow,
  OpanelWorkforceInsight,
} from '@/types/opanel-workforce';

type OpanelWorkforcePanelProps = {
  workforce: OpanelWorkforceInsight | null | undefined;
  variant?: 'dashboard' | 'page';
  className?: string;
};

const thBase =
  'whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-600 first:pl-4 last:pr-4';
const tdBase =
  'max-w-[220px] truncate px-3 py-2.5 align-middle text-sm text-slate-800 first:pl-4 last:pr-4 sm:max-w-none sm:whitespace-normal';

function badgeShift(active: boolean) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 ring-1 ring-emerald-200/80">
      <Radio className="h-3 w-3" />
      Shift jalan
    </span>
  ) : (
    <span className="text-xs text-slate-400">—</span>
  );
}

function badgeScheduleStatus(s: string) {
  const v = String(s || '').toLowerCase();
  const cls =
    v === 'confirmed'
      ? 'bg-violet-100 text-violet-900 ring-violet-200/80'
      : v === 'scheduled'
        ? 'bg-slate-100 text-slate-700 ring-slate-200/60'
        : 'bg-amber-50 text-amber-900 ring-amber-200/60';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${cls}`}>{s}</span>
  );
}

function badgeLogin(u: OpanelWorkforceLoginRow, threshold: number) {
  if (u.likelyActiveOnline) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
        Aktif (~{threshold} m)
      </span>
    );
  }
  if (u.minutesSinceLogin != null) {
    return <span className="text-xs font-medium text-slate-600">{u.minutesSinceLogin} menit lalu</span>;
  }
  return <span className="text-xs text-slate-400">—</span>;
}

type TableShellProps = {
  title: string;
  icon: React.ReactNode;
  count?: number;
  subtitle?: string;
  children: React.ReactNode;
  accent?: 'slate' | 'teal' | 'amber' | 'sky';
  maxHeightClass?: string;
};

function TableShell({ title, icon, count, subtitle, children, accent = 'slate', maxHeightClass }: TableShellProps) {
  const bar = {
    slate: 'from-slate-600 to-slate-800',
    teal: 'from-teal-600 to-emerald-700',
    amber: 'from-amber-500 to-orange-600',
    sky: 'from-sky-500 to-blue-600',
  }[accent];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
      <div className={`flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r ${bar} px-4 py-3 text-white`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
            {icon}
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold tracking-tight">{title}</h4>
            {subtitle && <p className="mt-0.5 text-[11px] font-medium text-white/85">{subtitle}</p>}
          </div>
        </div>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold tabular-nums ring-1 ring-white/25">
            {count}
          </span>
        )}
      </div>
      <div className={maxHeightClass ? `relative ${maxHeightClass} overflow-auto` : 'relative overflow-x-auto'}>
        {children}
      </div>
    </div>
  );
}

export default function OpanelWorkforcePanel({
  workforce,
  variant = 'dashboard',
  className = '',
}: OpanelWorkforcePanelProps) {
  if (!workforce) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500 ${className}`}
      >
        Data tim belum tersedia. Periksa koneksi atau muat ulang halaman.
      </div>
    );
  }

  const isPage = variant === 'page';
  const limSched = isPage ? workforce.schedulesToday.length : 8;
  const limLogin = isPage ? workforce.recentLogins.length : 8;
  const schedules = workforce.schedulesToday.slice(0, limSched);
  const onDuty = workforce.onDutyNow;
  const logins = workforce.recentLogins.slice(0, limLogin);

  const branchRowsWithId = workforce.byBranch.filter((b) => b.branchId != null).length;
  const kpi = [
    { label: 'Jadwal hari ini', value: workforce.schedulesToday.length, hint: 'Slot terjadwal WIB' },
    { label: 'Sedang shift', value: onDuty.length, hint: 'Menurut jam & jadwal' },
    { label: 'Login 24 jam', value: workforce.recentLogins.length, hint: 'Akun tenant' },
    {
      label: 'Cabang (baris ringkasan)',
      value: workforce.byBranch.length,
      hint: `${branchRowsWithId} dengan ID cabang`,
    },
  ];

  const tableScroll = isPage ? 'max-h-[min(72vh,560px)]' : 'max-h-72';

  const scheduleRows = (rows: OpanelWorkforceScheduleRow[], showShiftColumn: boolean) => (
    <table className="w-full min-w-[720px] border-collapse text-left">
      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
        <tr>
          <th className={thBase}>Cabang</th>
          <th className={thBase}>Karyawan</th>
          <th className={thBase}>Jabatan</th>
          <th className={thBase}>Shift</th>
          <th className={thBase}>Waktu</th>
          <th className={thBase}>Status jadwal</th>
          {showShiftColumn && <th className={thBase}>Slot aktif</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={showShiftColumn ? 7 : 6}
              className="px-4 py-10 text-center text-sm text-slate-500"
            >
              Tidak ada baris untuk ditampilkan.
            </td>
          </tr>
        ) : (
          rows.map((s, i) => (
            <tr
              key={s.scheduleId}
              className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
            >
              <td className={tdBase}>
                <div className="font-semibold text-slate-900">{s.branchName}</div>
                {s.branchCode && <div className="text-[11px] text-slate-500">{s.branchCode}</div>}
              </td>
              <td className={tdBase}>
                <div className="font-medium text-slate-900">{s.employeeName}</div>
                {s.employeeStatus && (
                  <div className="text-[11px] uppercase text-slate-500">{s.employeeStatus}</div>
                )}
              </td>
              <td className={`${tdBase} text-slate-700`}>{s.position || '—'}</td>
              <td className={`${tdBase} capitalize text-slate-700`}>{s.shiftType}</td>
              <td className={`${tdBase} font-mono text-[13px] font-semibold text-slate-800`}>
                {s.startTime} – {s.endTime}
              </td>
              <td className={tdBase}>{badgeScheduleStatus(s.scheduleStatus)}</td>
              {showShiftColumn && <td className={tdBase}>{badgeShift(s.onDutyNow)}</td>}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const loginTable = (
    <table className="w-full min-w-[680px] border-collapse text-left">
      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
        <tr>
          <th className={thBase}>Cabang</th>
          <th className={thBase}>Pengguna</th>
          <th className={thBase}>Email</th>
          <th className={thBase}>Peran</th>
          <th className={thBase}>Terakhir login</th>
          <th className={thBase}>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {logins.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
              Belum ada login dalam 24 jam terakhir.
            </td>
          </tr>
        ) : (
          logins.map((u, i) => (
            <tr key={u.userId} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              <td className={tdBase}>
                <div className="font-semibold text-slate-900">{u.branchName}</div>
                {u.branchCode && <div className="text-[11px] text-slate-500">{u.branchCode}</div>}
              </td>
              <td className={`${tdBase} font-medium text-slate-900`}>{u.name}</td>
              <td className={`${tdBase} text-slate-600`}>{u.email}</td>
              <td className={`${tdBase} capitalize text-slate-700`}>{u.role?.replace(/_/g, ' ') || '—'}</td>
              <td className={`${tdBase} text-sm text-slate-700`}>{u.lastLoginLabel || '—'}</td>
              <td className={tdBase}>{badgeLogin(u, workforce.onlineThresholdMinutes)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const branchTable = (
    <table className="w-full min-w-[520px] border-collapse text-left">
      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-slate-50/90">
        <tr>
          <th className={thBase}>Kode</th>
          <th className={thBase}>Cabang / outlet</th>
          <th className={thBase + ' text-right'}>Jadwal hari ini</th>
          <th className={thBase + ' text-right'}>Sedang shift</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {workforce.byBranch.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
              Belum ada data cabang atau jadwal.
            </td>
          </tr>
        ) : (
          [...workforce.byBranch]
            .sort((a, b) => (a.branchName || '').localeCompare(b.branchName || '', 'id'))
            .map((b, i) => (
              <tr key={b.branchId || 'unassigned'} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className={`${tdBase} font-mono text-xs text-slate-600`}>{b.branchCode || '—'}</td>
                <td className={`${tdBase} font-semibold text-slate-900`}>{b.branchName}</td>
                <td className={`${tdBase} text-right tabular-nums font-bold text-slate-800`}>{b.scheduledToday}</td>
                <td className={`${tdBase} text-right tabular-nums font-bold text-teal-700`}>{b.onDutyNow}</td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  );

  /* ---------- Halaman penuh: tabel vertikal + KPI ---------- */
  if (isPage) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-teal-700">
              <Table2 className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Tampilan tabel</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Ringkasan operasional hari ini</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tanggal bisnis <span className="font-semibold text-slate-800">{workforce.dateLocal}</span> (
              {workforce.timezone})
            </p>
          </div>
          <Link
            href="/employees/schedules"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/70"
          >
            Kelola jadwal di cabang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpi.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 px-4 py-3 shadow-sm ring-1 ring-slate-100/60"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{k.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{k.value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{k.hint}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm leading-relaxed text-amber-950/90 ring-1 ring-amber-100/80">
          <span className="font-semibold">Catatan data: </span>
          {workforce.note}
        </div>

        <TableShell
          title="Ringkasan per cabang"
          subtitle="Agregasi jadwal hari ini vs slot shift yang sedang berjalan"
          icon={<Building2 className="h-4 w-4 text-white" strokeWidth={2} />}
          count={workforce.byBranch.length}
          accent="slate"
          maxHeightClass={tableScroll}
        >
          {branchTable}
        </TableShell>

        <TableShell
          title="Sedang bertugas (slot shift aktif)"
          subtitle="Baris yang jam sekarang berada di dalam rentang jadwal tersimpan"
          icon={<Clock className="h-4 w-4 text-white" strokeWidth={2} />}
          count={onDuty.length}
          accent="teal"
          maxHeightClass={tableScroll}
        >
          {scheduleRows(onDuty, false)}
        </TableShell>

        <TableShell
          title="Semua jadwal hari ini"
          subtitle={`${workforce.schedulesToday.length} entri · urut waktu mulai`}
          icon={<CalendarDays className="h-4 w-4 text-white" strokeWidth={2} />}
          count={workforce.schedulesToday.length}
          accent="amber"
          maxHeightClass={tableScroll}
        >
          {scheduleRows(workforce.schedulesToday, true)}
        </TableShell>

        <TableShell
          title="Login akun (24 jam terakhir)"
          subtitle={`Last login di server · "Aktif" = dalam ${workforce.onlineThresholdMinutes} menit terakhir`}
          icon={<LogIn className="h-4 w-4 text-white" strokeWidth={2} />}
          count={workforce.recentLogins.length}
          accent="sky"
          maxHeightClass={tableScroll}
        >
          {loginTable}
        </TableShell>
      </div>
    );
  }

  /* ---------- Dashboard: ringkas + mini-tabel ---------- */
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            <Briefcase className="h-4 w-4" />
            Back office — tim multi-cabang
          </h3>
          <p className="mt-1 text-lg font-bold text-slate-900">Jadwal hari ini, bertugas & login</p>
          <p className="mt-1 text-xs text-slate-500">
            Tanggal bisnis ({workforce.timezone}):{' '}
            <span className="font-semibold text-slate-700">{workforce.dateLocal}</span>
            {' · '}
            <Link href="/opanel/workforce" className="font-bold text-teal-700 hover:underline">
              Buka tampilan tabel lengkap
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/opanel/workforce"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/60"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Tabel penuh
          </Link>
          <Link
            href="/employees/schedules"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/60"
          >
            Kelola jadwal
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
        {workforce.note}
      </p>

      {workforce.byBranch.length > 0 && (
        <TableShell
          title="Ringkasan cabang"
          icon={<Building2 className="h-4 w-4 text-white" strokeWidth={2} />}
          count={workforce.byBranch.length}
          accent="slate"
          maxHeightClass="max-h-56"
        >
          {branchTable}
        </TableShell>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <TableShell
          title="Sedang bertugas"
          icon={<Clock className="h-4 w-4 text-white" strokeWidth={2} />}
          count={onDuty.length}
          accent="teal"
          maxHeightClass="max-h-72"
        >
          {scheduleRows(onDuty, false)}
        </TableShell>

        <TableShell
          title="Jadwal terjadwal"
          subtitle={`Menampilkan ${schedules.length}${workforce.schedulesToday.length > schedules.length ? ` dari ${workforce.schedulesToday.length}` : ''}`}
          icon={<CalendarDays className="h-4 w-4 text-white" strokeWidth={2} />}
          accent="amber"
          maxHeightClass="max-h-72"
        >
          {scheduleRows(schedules, true)}
        </TableShell>

        <TableShell
          title="Login 24 jam"
          subtitle={`±${workforce.onlineThresholdMinutes} m = aktif`}
          icon={<LogIn className="h-4 w-4 text-white" strokeWidth={2} />}
          accent="sky"
          maxHeightClass="max-h-72"
        >
          {loginTable}
        </TableShell>
      </div>
    </section>
  );
}
