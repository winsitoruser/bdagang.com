import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import {
  CalendarDays, Clock, CheckCircle, XCircle, AlertTriangle, Users,
  Search, Filter, Download, Plus, Eye, ChevronDown, Building2,
  Coffee, Heart, Baby, UserX, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveRequest {
  id: string;
  employeeName: string;
  position: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approvedAt?: string;
  rejectionReason?: string;
}

const leaveTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  annual: { label: 'Cuti Tahunan', icon: CalendarDays, color: 'bg-blue-100 text-blue-700' },
  sick: { label: 'Sakit', icon: Heart, color: 'bg-red-100 text-red-700' },
  maternity: { label: 'Melahirkan', icon: Baby, color: 'bg-pink-100 text-pink-700' },
  paternity: { label: 'Cuti Ayah', icon: Baby, color: 'bg-indigo-100 text-indigo-700' },
  unpaid: { label: 'Tanpa Gaji', icon: UserX, color: 'bg-gray-100 text-gray-700' },
  personal: { label: 'Keperluan Pribadi', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  bereavement: { label: 'Duka Cita', icon: Heart, color: 'bg-purple-100 text-purple-700' },
  marriage: { label: 'Pernikahan', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  religious: { label: 'Keagamaan', icon: Calendar, color: 'bg-emerald-100 text-emerald-700' },
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Disetujui', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export default function LeaveManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionReason, setActionReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('leaveType', typeFilter);
      const res = await fetch(`/api/hq/hris/leave?${params}`);
      const json = await res.json();
      if (json.success) {
        setLeaves(json.data || []);
        setSummary(json.summary || {});
      }
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [statusFilter, typeFilter]);

  if (!mounted) return null;

  const filtered = leaves.filter(l =>
    l.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/hq/hris/leave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Cuti disetujui');
        fetchData();
        setSelectedLeave(null);
      }
    } catch { toast.error('Gagal menyetujui'); }
  };

  const handleReject = async (id: string) => {
    if (!actionReason) { toast.error('Alasan penolakan wajib diisi'); return; }
    try {
      const res = await fetch('/api/hq/hris/leave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected', rejectionReason: actionReason })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Cuti ditolak');
        fetchData();
        setSelectedLeave(null);
        setActionReason('');
      }
    } catch { toast.error('Gagal menolak'); }
  };

  return (
    <HQLayout title="Manajemen Cuti" subtitle="Kelola pengajuan dan approval cuti karyawan">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><CalendarDays className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{summary.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Menunggu</p>
                <p className="text-xl font-bold text-yellow-600">{summary.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Disetujui</p>
                <p className="text-xl font-bold text-green-600">{summary.approved || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Ditolak</p>
                <p className="text-xl font-bold text-red-600">{summary.rejected || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Hari Dipakai</p>
                <p className="text-xl font-bold">{summary.totalDaysUsed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Cari karyawan..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-52" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm">
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm">
                <option value="all">Semua Tipe</option>
                <option value="annual">Cuti Tahunan</option>
                <option value="sick">Sakit</option>
                <option value="personal">Keperluan Pribadi</option>
                <option value="maternity">Melahirkan</option>
                <option value="unpaid">Tanpa Gaji</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe Cuti</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durasi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data cuti</td></tr>
                ) : (
                  filtered.map((leave) => {
                    const typeConf = leaveTypeConfig[leave.leaveType] || leaveTypeConfig.personal;
                    const TypeIcon = typeConf.icon;
                    const statConf = statusConfig[leave.status] || statusConfig.pending;
                    const StatIcon = statConf.icon;
                    return (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{leave.employeeName}</p>
                          <p className="text-xs text-gray-500">{leave.position} · {leave.department}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeConf.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <p>{new Date(leave.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-xs text-gray-400">s/d {new Date(leave.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold">{leave.totalDays}</span>
                          <span className="text-xs text-gray-500"> hari</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{leave.reason || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statConf.color}`}>
                            <StatIcon className="w-3 h-3" />
                            {statConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {leave.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleApprove(leave.id)}
                                className="px-2.5 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Setujui</button>
                              <button onClick={() => { setSelectedLeave(leave); setShowModal(true); }}
                                className="px-2.5 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Tolak</button>
                            </div>
                          ) : (
                            <button onClick={() => { setSelectedLeave(leave); setShowModal(true); }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail / Reject Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detail Cuti</h3>
              <button onClick={() => { setShowModal(false); setSelectedLeave(null); setActionReason(''); }}
                className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Karyawan</span><p className="font-medium">{selectedLeave.employeeName}</p></div>
                <div><span className="text-gray-500">Tipe</span><p className="font-medium">{leaveTypeConfig[selectedLeave.leaveType]?.label || selectedLeave.leaveType}</p></div>
                <div><span className="text-gray-500">Mulai</span><p className="font-medium">{new Date(selectedLeave.startDate).toLocaleDateString('id-ID')}</p></div>
                <div><span className="text-gray-500">Selesai</span><p className="font-medium">{new Date(selectedLeave.endDate).toLocaleDateString('id-ID')}</p></div>
                <div><span className="text-gray-500">Durasi</span><p className="font-medium">{selectedLeave.totalDays} hari kerja</p></div>
                <div><span className="text-gray-500">Status</span><p className="font-medium">{statusConfig[selectedLeave.status]?.label}</p></div>
              </div>
              {selectedLeave.reason && (
                <div className="text-sm"><span className="text-gray-500">Alasan:</span><p className="mt-1 text-gray-700">{selectedLeave.reason}</p></div>
              )}
              {selectedLeave.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan penolakan (wajib jika tolak)</label>
                  <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Tuliskan alasan..." />
                </div>
              )}
            </div>
            {selectedLeave.status === 'pending' && (
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button onClick={() => handleReject(selectedLeave.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Tolak</button>
                <button onClick={() => handleApprove(selectedLeave.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Setujui</button>
              </div>
            )}
          </div>
        </div>
      )}
    </HQLayout>
  );
}
