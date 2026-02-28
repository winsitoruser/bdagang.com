import { useState, useEffect, useCallback } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { Briefcase, Users, Clock, DollarSign, Plus, Edit, Trash2, X, Check, Eye, Search, BarChart3, Calendar } from 'lucide-react';

interface ProjectItem { id: string; project_code: string; name: string; description: string; client_name: string; location: string; start_date: string; end_date: string; status: string; budget_amount: number; actual_cost: number; project_manager_id: number; department: string; industry: string; completion_percent: number; priority: string; milestones: any[]; }
interface Worker { id: string; project_id: string; employee_id: number; role: string; assignment_start: string; assignment_end: string; daily_rate: number; hourly_rate: number; allocation_percent: number; status: string; worker_type: string; contract_number: string; }
interface Timesheet { id: string; project_id: string; employee_id: number; timesheet_date: string; hours_worked: number; overtime_hours: number; activity_description: string; task_category: string; status: string; }
interface PayrollItem { id: string; project_id: string; employee_id: number; period_start: string; period_end: string; regular_hours: number; overtime_hours: number; days_worked: number; gross_amount: number; net_amount: number; status: string; }

type TabKey = 'projects' | 'workers' | 'timesheets' | 'payroll';

export default function ProjectManagementPage() {
  const [tab, setTab] = useState<TabKey>('projects');
  const [overview, setOverview] = useState<any>({});
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectDetail, setProjectDetail] = useState<any>(null);

  const [projForm, setProjForm] = useState({ name: '', description: '', clientName: '', location: '', startDate: '', endDate: '', budgetAmount: 0, department: '', industry: '', priority: 'medium', contractNumber: '', contractValue: 0 });
  const [workerForm, setWorkerForm] = useState({ projectId: '', employeeId: '', role: '', assignmentStart: '', assignmentEnd: '', dailyRate: 0, hourlyRate: 0, allocationPercent: 100, workerType: 'permanent' });
  const [tsForm, setTsForm] = useState({ projectId: '', employeeId: '', timesheetDate: '', hoursWorked: 8, overtimeHours: 0, activityDescription: '', taskCategory: '' });
  const [payrollCalcForm, setPayrollCalcForm] = useState({ projectId: '', employeeId: '', periodStart: '', periodEnd: '' });

  const showToast = (msg: string, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const fmtCur = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;

  const api = useCallback(async (action: string, method = 'GET', body?: any, extra = '') => {
    const opts: any = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`/api/hq/hris/project-management?action=${action}${extra}`, opts);
    return r.json();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, pj, wk, ts, pr] = await Promise.all([
        api('overview'), api('projects'), api('workers'), api('timesheets'), api('payroll')
      ]);
      setOverview(ov.data || {});
      setProjects(pj.data || []);
      setWorkers(wk.data || []);
      setTimesheets(ts.data || []);
      setPayrollItems(pr.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [api]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = (type: string) => {
    setEditingItem(null); setModalType(type); setShowModal(true);
    if (type === 'project') setProjForm({ name: '', description: '', clientName: '', location: '', startDate: '', endDate: '', budgetAmount: 0, department: '', industry: '', priority: 'medium', contractNumber: '', contractValue: 0 });
    if (type === 'worker') setWorkerForm({ projectId: selectedProject || '', employeeId: '', role: '', assignmentStart: '', assignmentEnd: '', dailyRate: 0, hourlyRate: 0, allocationPercent: 100, workerType: 'permanent' });
    if (type === 'timesheet') setTsForm({ projectId: selectedProject || '', employeeId: '', timesheetDate: new Date().toISOString().split('T')[0], hoursWorked: 8, overtimeHours: 0, activityDescription: '', taskCategory: '' });
    if (type === 'calc-payroll') { setPayrollCalcForm({ projectId: selectedProject || '', employeeId: '', periodStart: '', periodEnd: '' }); setModalType('calc-payroll'); }
  };

  const handleSave = async () => {
    try {
      if (modalType === 'project') {
        if (editingItem) await api('project', 'PUT', projForm, `&id=${editingItem.id}`);
        else await api('project', 'POST', projForm);
      } else if (modalType === 'worker') {
        await api('worker', 'POST', workerForm);
      } else if (modalType === 'timesheet') {
        await api('timesheet', 'POST', tsForm);
      } else if (modalType === 'calc-payroll') {
        await api('calculate-payroll', 'POST', payrollCalcForm);
      }
      showToast(editingItem ? 'Updated' : 'Created');
      setShowModal(false); loadData();
    } catch (e) { showToast('Error', 'error'); }
  };

  const handleDelete = async (action: string, id: string) => {
    if (!confirm('Hapus data ini?')) return;
    await api(action, 'DELETE', null, `&id=${id}`);
    showToast('Deleted'); loadData();
  };

  const statusColor = (s: string) => {
    const m: any = { planning: 'bg-gray-100 text-gray-800', active: 'bg-green-100 text-green-800', on_hold: 'bg-yellow-100 text-yellow-800', completed: 'bg-blue-100 text-blue-800', cancelled: 'bg-red-100 text-red-800', draft: 'bg-gray-100 text-gray-800', submitted: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', calculated: 'bg-purple-100 text-purple-800', paid: 'bg-emerald-100 text-emerald-800' };
    return m[s] || 'bg-gray-100 text-gray-800';
  };

  const priorityColor = (p: string) => {
    const m: any = { low: 'border-gray-300', medium: 'border-blue-300', high: 'border-orange-300', critical: 'border-red-400' };
    return m[p] || 'border-gray-300';
  };

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'projects', label: 'Proyek', icon: Briefcase },
    { key: 'workers', label: 'Tenaga Kerja', icon: Users },
    { key: 'timesheets', label: 'Timesheet', icon: Clock },
    { key: 'payroll', label: 'Payroll Proyek', icon: DollarSign },
  ];

  return (
    <HQLayout title="Project & Contract Worker Management">
    <div className="p-6 max-w-7xl mx-auto">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.msg}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project & Contract Worker Management</h1>
        <p className="text-gray-500 mt-1">Kelola proyek, tenaga kerja kontrak, timesheet, dan payroll berbasis proyek</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <Briefcase className="w-5 h-5 text-indigo-600 mb-1" />
          <p className="text-2xl font-bold">{overview.totalProjects || 0}</p>
          <p className="text-xs text-gray-500">Total Proyek ({overview.activeProjects || 0} aktif)</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <Users className="w-5 h-5 text-green-600 mb-1" />
          <p className="text-2xl font-bold">{overview.activeWorkers || 0}</p>
          <p className="text-xs text-gray-500">Pekerja Aktif</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <DollarSign className="w-5 h-5 text-blue-600 mb-1" />
          <p className="text-2xl font-bold">{fmtCur(overview.totalBudget || 0)}</p>
          <p className="text-xs text-gray-500">Total Budget</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <BarChart3 className="w-5 h-5 text-orange-600 mb-1" />
          <p className="text-2xl font-bold">{fmtCur(overview.totalActual || 0)}</p>
          <p className="text-xs text-gray-500">Biaya Aktual</p>
        </div>
      </div>

      {/* Project Filter */}
      {tab !== 'projects' && (
        <div className="mb-4">
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">Semua Proyek</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.name}</option>)}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setProjectDetail(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Loading...</div>}

      {/* PROJECTS TAB */}
      {!loading && tab === 'projects' && !projectDetail && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar Proyek</h2>
            <button onClick={() => openAdd('project')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Buat Proyek
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className={`bg-white border-l-4 ${priorityColor(p.priority)} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{p.project_code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    {p.client_name && <p className="text-sm text-gray-500">Client: {p.client_name}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={async () => { const res = await api('project-detail', 'GET', null, `&id=${p.id}`); setProjectDetail(res.data); }} className="p-1.5 text-gray-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setEditingItem(p); setProjForm({ name: p.name, description: p.description || '', clientName: p.client_name || '', location: p.location || '', startDate: p.start_date || '', endDate: p.end_date || '', budgetAmount: p.budget_amount, department: p.department || '', industry: p.industry || '', priority: p.priority, contractNumber: '', contractValue: 0 }); setModalType('project'); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete('project', p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description}</p>}
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{Number(p.completion_percent || 0).toFixed(0)}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${p.completion_percent || 0}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
                  <div><span className="text-gray-400">Budget</span><p className="font-medium">{fmtCur(p.budget_amount)}</p></div>
                  <div><span className="text-gray-400">Aktual</span><p className="font-medium">{fmtCur(p.actual_cost)}</p></div>
                  <div><span className="text-gray-400">Periode</span><p className="font-medium">{p.start_date ? new Date(p.start_date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }) : '-'}</p></div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-center text-gray-400 py-8 col-span-2">Belum ada proyek</p>}
          </div>
        </div>
      )}

      {/* PROJECT DETAIL */}
      {!loading && tab === 'projects' && projectDetail && (
        <div>
          <button onClick={() => setProjectDetail(null)} className="text-sm text-indigo-600 mb-4 hover:underline">← Kembali</button>
          <div className="bg-white border rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-indigo-600">{projectDetail.project?.project_code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(projectDetail.project?.status)}`}>{projectDetail.project?.status}</span>
            </div>
            <h2 className="text-xl font-bold">{projectDetail.project?.name}</h2>
            <p className="text-gray-500">{projectDetail.project?.description}</p>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Budget</p><p className="font-bold">{fmtCur(projectDetail.project?.budget_amount)}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Aktual</p><p className="font-bold">{fmtCur(projectDetail.project?.actual_cost)}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Pekerja</p><p className="font-bold">{(projectDetail.workers || []).length}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Total Jam</p><p className="font-bold">{projectDetail.totalHours || 0}</p></div>
            </div>
          </div>
          {/* Workers */}
          <div className="bg-white border rounded-xl p-5 mb-4">
            <h3 className="font-semibold mb-3">Tim Proyek ({(projectDetail.workers || []).length})</h3>
            <div className="space-y-2">
              {(projectDetail.workers || []).map((w: any) => (
                <div key={w.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <div><span className="font-medium">#{w.employee_id}</span> - <span>{w.role || 'Member'}</span></div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="capitalize">{w.worker_type}</span>
                    <span>{w.allocation_percent}%</span>
                    <span>{fmtCur(w.daily_rate)}/hari</span>
                  </div>
                </div>
              ))}
              {(projectDetail.workers || []).length === 0 && <p className="text-sm text-gray-400">Belum ada pekerja</p>}
            </div>
          </div>
          {/* Payroll */}
          {(projectDetail.payrollItems || []).length > 0 && (
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold mb-3">Payroll Items</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Karyawan</th><th className="px-3 py-2 text-left">Periode</th><th className="px-3 py-2 text-right">Hari</th><th className="px-3 py-2 text-right">Gross</th><th className="px-3 py-2 text-right">Net</th><th className="px-3 py-2 text-left">Status</th></tr></thead>
                <tbody className="divide-y">
                  {(projectDetail.payrollItems || []).map((pi: any) => (
                    <tr key={pi.id}><td className="px-3 py-2">#{pi.employee_id}</td><td className="px-3 py-2 text-xs">{pi.period_start && new Date(pi.period_start).toLocaleDateString('id-ID')} - {pi.period_end && new Date(pi.period_end).toLocaleDateString('id-ID')}</td><td className="px-3 py-2 text-right">{pi.days_worked}</td><td className="px-3 py-2 text-right">{fmtCur(pi.gross_amount)}</td><td className="px-3 py-2 text-right font-medium">{fmtCur(pi.net_amount)}</td><td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(pi.status)}`}>{pi.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WORKERS TAB */}
      {!loading && tab === 'workers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tenaga Kerja Proyek</h2>
            <button onClick={() => openAdd('worker')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              <Plus className="w-4 h-4" /> Tambah Pekerja
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Proyek</th>
                  <th className="px-4 py-3 text-left">Karyawan</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-right">Rate/Hari</th>
                  <th className="px-4 py-3 text-right">Alokasi</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {workers.filter(w => !selectedProject || w.project_id === selectedProject).map(w => {
                  const proj = projects.find(p => p.id === w.project_id);
                  return (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{proj?.project_code || w.project_id.slice(0, 8)}</td>
                      <td className="px-4 py-3">#{w.employee_id}</td>
                      <td className="px-4 py-3">{w.role || '-'}</td>
                      <td className="px-4 py-3 capitalize">{w.worker_type}</td>
                      <td className="px-4 py-3 text-right">{fmtCur(w.daily_rate)}</td>
                      <td className="px-4 py-3 text-right">{w.allocation_percent}%</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(w.status)}`}>{w.status}</span></td>
                      <td className="px-4 py-3"><button onClick={() => handleDelete('worker', w.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {workers.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada pekerja proyek</p>}
          </div>
        </div>
      )}

      {/* TIMESHEETS TAB */}
      {!loading && tab === 'timesheets' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Timesheet Proyek</h2>
            <button onClick={() => openAdd('timesheet')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Input Timesheet
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Proyek</th>
                  <th className="px-4 py-3 text-left">Karyawan</th>
                  <th className="px-4 py-3 text-right">Jam Kerja</th>
                  <th className="px-4 py-3 text-right">Lembur</th>
                  <th className="px-4 py-3 text-left">Aktivitas</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {timesheets.filter(t => !selectedProject || t.project_id === selectedProject).map(t => {
                  const proj = projects.find(p => p.id === t.project_id);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{t.timesheet_date && new Date(t.timesheet_date).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-medium">{proj?.project_code || '-'}</td>
                      <td className="px-4 py-3">#{t.employee_id}</td>
                      <td className="px-4 py-3 text-right">{t.hours_worked}h</td>
                      <td className="px-4 py-3 text-right">{Number(t.overtime_hours) > 0 ? `${t.overtime_hours}h` : '-'}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{t.activity_description}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>{t.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {t.status === 'submitted' && (
                            <button onClick={async () => { await api('approve-timesheet', 'POST', { id: t.id }); showToast('Approved'); loadData(); }} className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => handleDelete('timesheet', t.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {timesheets.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada data timesheet</p>}
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {!loading && tab === 'payroll' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Payroll Berbasis Proyek</h2>
            <button onClick={() => openAdd('calc-payroll')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
              <DollarSign className="w-4 h-4" /> Hitung Payroll
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Proyek</th>
                  <th className="px-4 py-3 text-left">Karyawan</th>
                  <th className="px-4 py-3 text-left">Periode</th>
                  <th className="px-4 py-3 text-right">Hari</th>
                  <th className="px-4 py-3 text-right">Jam Regular</th>
                  <th className="px-4 py-3 text-right">Lembur</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payrollItems.filter(p => !selectedProject || p.project_id === selectedProject).map(pi => {
                  const proj = projects.find(p => p.id === pi.project_id);
                  return (
                    <tr key={pi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{proj?.project_code || '-'}</td>
                      <td className="px-4 py-3">#{pi.employee_id}</td>
                      <td className="px-4 py-3 text-xs">{pi.period_start && new Date(pi.period_start).toLocaleDateString('id-ID')} - {pi.period_end && new Date(pi.period_end).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 text-right">{pi.days_worked}</td>
                      <td className="px-4 py-3 text-right">{pi.regular_hours}h</td>
                      <td className="px-4 py-3 text-right">{Number(pi.overtime_hours) > 0 ? `${pi.overtime_hours}h` : '-'}</td>
                      <td className="px-4 py-3 text-right">{fmtCur(pi.gross_amount)}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmtCur(pi.net_amount)}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(pi.status)}`}>{pi.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {pi.status === 'calculated' && (
                            <button onClick={async () => { await api('approve-payroll', 'POST', { id: pi.id }); showToast('Approved'); loadData(); }} className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded">Approve</button>
                          )}
                          {pi.status === 'approved' && (
                            <button onClick={async () => { await api('pay-payroll', 'POST', { id: pi.id, paymentRef: `PAY-${Date.now()}` }); showToast('Paid'); loadData(); }} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">Bayar</button>
                          )}
                          <button onClick={() => handleDelete('payroll', pi.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payrollItems.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada data payroll proyek</p>}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-lg font-semibold">
                {modalType === 'project' ? (editingItem ? 'Edit Proyek' : 'Buat Proyek') : modalType === 'worker' ? 'Tambah Pekerja' : modalType === 'timesheet' ? 'Input Timesheet' : 'Hitung Payroll'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {modalType === 'project' && (<>
                <div><label className="text-sm font-medium text-gray-700">Nama Proyek</label><input value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">Deskripsi</label><textarea value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Client</label><input value={projForm.clientName} onChange={e => setProjForm({ ...projForm, clientName: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Lokasi</label><input value={projForm.location} onChange={e => setProjForm({ ...projForm, location: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Mulai</label><input type="date" value={projForm.startDate} onChange={e => setProjForm({ ...projForm, startDate: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Selesai</label><input type="date" value={projForm.endDate} onChange={e => setProjForm({ ...projForm, endDate: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Budget (Rp)</label><input type="number" value={projForm.budgetAmount} onChange={e => setProjForm({ ...projForm, budgetAmount: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Prioritas</label>
                    <select value={projForm.priority} onChange={e => setProjForm({ ...projForm, priority: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Departemen</label><input value={projForm.department} onChange={e => setProjForm({ ...projForm, department: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Industri</label>
                    <select value={projForm.industry} onChange={e => setProjForm({ ...projForm, industry: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                      <option value="">Pilih</option><option value="construction">Konstruksi</option><option value="mining">Tambang</option><option value="manufacturing">Manufaktur</option><option value="it">IT</option><option value="consulting">Konsulting</option><option value="outsourcing">Outsourcing</option><option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
              </>)}
              {modalType === 'worker' && (<>
                <div><label className="text-sm font-medium text-gray-700">Proyek</label>
                  <select value={workerForm.projectId} onChange={e => setWorkerForm({ ...workerForm, projectId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="">Pilih Proyek</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700">ID Karyawan</label><input type="number" value={workerForm.employeeId} onChange={e => setWorkerForm({ ...workerForm, employeeId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">Role</label><input value={workerForm.role} onChange={e => setWorkerForm({ ...workerForm, role: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Site Engineer, Foreman" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Rate Harian (Rp)</label><input type="number" value={workerForm.dailyRate} onChange={e => setWorkerForm({ ...workerForm, dailyRate: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Alokasi %</label><input type="number" value={workerForm.allocationPercent} onChange={e => setWorkerForm({ ...workerForm, allocationPercent: parseInt(e.target.value) || 100 })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Tipe Pekerja</label>
                  <select value={workerForm.workerType} onChange={e => setWorkerForm({ ...workerForm, workerType: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="permanent">Permanent</option><option value="contract">Kontrak</option><option value="freelance">Freelance</option><option value="outsource">Outsource</option>
                  </select>
                </div>
              </>)}
              {modalType === 'timesheet' && (<>
                <div><label className="text-sm font-medium text-gray-700">Proyek</label>
                  <select value={tsForm.projectId} onChange={e => setTsForm({ ...tsForm, projectId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="">Pilih Proyek</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700">ID Karyawan</label><input type="number" value={tsForm.employeeId} onChange={e => setTsForm({ ...tsForm, employeeId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="text-sm font-medium text-gray-700">Tanggal</label><input type="date" value={tsForm.timesheetDate} onChange={e => setTsForm({ ...tsForm, timesheetDate: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Jam Kerja</label><input type="number" value={tsForm.hoursWorked} onChange={e => setTsForm({ ...tsForm, hoursWorked: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Jam Lembur</label><input type="number" value={tsForm.overtimeHours} onChange={e => setTsForm({ ...tsForm, overtimeHours: parseFloat(e.target.value) || 0 })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <div><label className="text-sm font-medium text-gray-700">Deskripsi Aktivitas</label><textarea value={tsForm.activityDescription} onChange={e => setTsForm({ ...tsForm, activityDescription: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
              </>)}
              {modalType === 'calc-payroll' && (<>
                <div><label className="text-sm font-medium text-gray-700">Proyek</label>
                  <select value={payrollCalcForm.projectId} onChange={e => setPayrollCalcForm({ ...payrollCalcForm, projectId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="">Pilih Proyek</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.name}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-medium text-gray-700">ID Karyawan</label><input type="number" value={payrollCalcForm.employeeId} onChange={e => setPayrollCalcForm({ ...payrollCalcForm, employeeId: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium text-gray-700">Periode Mulai</label><input type="date" value={payrollCalcForm.periodStart} onChange={e => setPayrollCalcForm({ ...payrollCalcForm, periodStart: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-sm font-medium text-gray-700">Periode Akhir</label><input type="date" value={payrollCalcForm.periodEnd} onChange={e => setPayrollCalcForm({ ...payrollCalcForm, periodEnd: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">Payroll akan dihitung otomatis dari timesheet yang sudah disetujui dalam periode ini, dikali rate harian pekerja.</p>
              </>)}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{modalType === 'calc-payroll' ? 'Hitung' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </HQLayout>
  );
}
