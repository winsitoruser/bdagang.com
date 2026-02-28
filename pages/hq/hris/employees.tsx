import { useState, useEffect, useCallback } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import {
  Users, Search, Plus, Eye, Edit, Trash2, X, Save, ChevronRight,
  Building2, Briefcase, GraduationCap, Award, FileText, Heart,
  Phone, Mail, MapPin, Calendar, User, Shield, AlertCircle,
  Filter, Download, RefreshCw, Clock, CheckCircle, XCircle, ChevronDown
} from 'lucide-react';

type TabType = 'list' | 'detail';
type DetailTab = 'personal' | 'family' | 'education' | 'certification' | 'experience' | 'documents' | 'contracts';

export default function EmployeeManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [detailTab, setDetailTab] = useState<DetailTab>('personal');

  // List state
  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  // Detail state
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [personalForm, setPersonalForm] = useState<any>({});

  // Sub-data modals
  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalType, setSubModalType] = useState<string>('');
  const [subForm, setSubForm] = useState<any>({});

  // Toast
  const [toast, setToast] = useState<any>(null);
  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) fetchEmployees(); }, [mounted, search, filterDept, filterStatus, page]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'list', page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (filterDept) params.set('department', filterDept);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/hq/hris/employee-profile?${params}`);
      const json = await res.json();
      setEmployees(json.data || []);
      setTotal(json.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchDetail = async (empId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hq/hris/employee-profile?action=detail&employeeId=${empId}`);
      const json = await res.json();
      setSelectedEmployee(json.data);
      setPersonalForm(json.data || {});
      setActiveTab('detail');
      setDetailTab('personal');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const savePersonal = async () => {
    try {
      const res = await fetch('/api/hq/hris/employee-profile?action=update-personal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalForm)
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Data personal berhasil disimpan');
        setEditMode(false);
        fetchDetail(personalForm.id);
      } else showToast('error', json.error || 'Gagal menyimpan');
    } catch (e) { showToast('error', 'Gagal menyimpan'); }
  };

  const saveSubData = async () => {
    try {
      const res = await fetch(`/api/hq/hris/employee-profile?action=${subModalType}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subForm, employee_id: selectedEmployee.id })
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Data berhasil disimpan');
        setShowSubModal(false);
        setSubForm({});
        fetchDetail(selectedEmployee.id);
      } else showToast('error', json.error || 'Gagal menyimpan');
    } catch (e) { showToast('error', 'Gagal menyimpan'); }
  };

  const deleteSubData = async (type: string, id: string) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      const res = await fetch(`/api/hq/hris/employee-profile?action=${type}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Data berhasil dihapus');
        fetchDetail(selectedEmployee.id);
      }
    } catch (e) { showToast('error', 'Gagal menghapus'); }
  };

  const openSubModal = (type: string, data?: any) => {
    setSubModalType(type);
    setSubForm(data ? { ...data } : {});
    setShowSubModal(true);
  };

  const DEPARTMENTS = ['MANAGEMENT','OPERATIONS','SALES','FINANCE','ADMINISTRATION','WAREHOUSE','KITCHEN','CUSTOMER_SERVICE','IT','HR','CLINICAL','PHARMACY','MARKETING','LOGISTICS','PRODUCTION'];

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const fmtCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700', INACTIVE: 'bg-gray-100 text-gray-700',
      ON_LEAVE: 'bg-yellow-100 text-yellow-700', TERMINATED: 'bg-red-100 text-red-700',
      active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  if (!mounted) return null;

  return (
    <HQLayout title="Database Karyawan" currentMenu="hris">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Database Karyawan
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola data lengkap karyawan</p>
          </div>
          {activeTab === 'detail' && (
            <button onClick={() => { setActiveTab('list'); setSelectedEmployee(null); }}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1">
              ← Kembali ke Daftar
            </button>
          )}
        </div>

        {/* ===== LIST VIEW ===== */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cari nama, kode, email..."
                      value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
                <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}
                  className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Semua Departemen</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Semua Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              <div className="mt-2 text-xs text-gray-500">{total} karyawan ditemukan</div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Karyawan</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Departemen</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Jabatan</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Cabang</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Kontrak</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
                    ) : employees.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data karyawan</td></tr>
                    ) : employees.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => fetchDetail(emp.id)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {(emp.name || '?')[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.employee_id} • {emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.position}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{emp.branch_name || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs">{emp.contract_type || '-'}</span>
                          {emp.contract_end && <p className="text-[10px] text-gray-400">s/d {fmtDate(emp.contract_end)}</p>}
                        </td>
                        <td className="px-4 py-3">{statusBadge(emp.status)}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-500">Halaman {page} dari {Math.ceil(total / 20)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1 border rounded text-xs disabled:opacity-50">Prev</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                      className="px-3 py-1 border rounded text-xs disabled:opacity-50">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== DETAIL VIEW ===== */}
        {activeTab === 'detail' && selectedEmployee && (
          <div className="space-y-4">
            {/* Employee Header Card */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {(selectedEmployee.name || '?')[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800">{selectedEmployee.name}</h2>
                    {statusBadge(selectedEmployee.status)}
                  </div>
                  <p className="text-sm text-gray-500">{selectedEmployee.employee_id} • {selectedEmployee.position}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{selectedEmployee.department}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedEmployee.branch_name || '-'}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedEmployee.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedEmployee.phone_number || '-'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Bergabung: {fmtDate(selectedEmployee.join_date)}</span>
                    {selectedEmployee.grade_name && (
                      <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />Grade: {selectedEmployee.grade_code} - {selectedEmployee.grade_name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="bg-white rounded-xl border">
              <div className="border-b overflow-x-auto">
                <div className="flex min-w-max">
                  {([
                    { key: 'personal', label: 'Data Personal', icon: User },
                    { key: 'family', label: 'Keluarga', icon: Heart },
                    { key: 'education', label: 'Pendidikan', icon: GraduationCap },
                    { key: 'certification', label: 'Sertifikasi', icon: Award },
                    { key: 'experience', label: 'Pengalaman', icon: Briefcase },
                    { key: 'documents', label: 'Dokumen', icon: FileText },
                    { key: 'contracts', label: 'Kontrak', icon: Shield },
                  ] as { key: DetailTab; label: string; icon: any }[]).map(tab => (
                    <button key={tab.key} onClick={() => setDetailTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        detailTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>
                      <tab.icon className="w-4 h-4" /> {tab.label}
                      {tab.key === 'family' && selectedEmployee.families?.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedEmployee.families.length}</span>
                      )}
                      {tab.key === 'education' && selectedEmployee.educations?.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedEmployee.educations.length}</span>
                      )}
                      {tab.key === 'certification' && selectedEmployee.certifications?.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedEmployee.certifications.length}</span>
                      )}
                      {tab.key === 'documents' && selectedEmployee.documents?.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedEmployee.documents.length}</span>
                      )}
                      {tab.key === 'contracts' && selectedEmployee.contracts?.length > 0 && (
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedEmployee.contracts.length}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {/* ===== PERSONAL TAB ===== */}
                {detailTab === 'personal' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Informasi Personal</h3>
                      {!editMode ? (
                        <button onClick={() => { setEditMode(true); setPersonalForm({ ...selectedEmployee }); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
                          <button onClick={savePersonal} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Save className="w-3.5 h-3.5" /> Simpan
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Nama Lengkap', key: 'name', type: 'text' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'No. Telepon', key: 'phone_number', type: 'text' },
                        { label: 'Jenis Kelamin', key: 'gender', type: 'select', options: ['MALE','FEMALE'] },
                        { label: 'Tempat Lahir', key: 'place_of_birth', type: 'text' },
                        { label: 'Tanggal Lahir', key: 'date_of_birth', type: 'date' },
                        { label: 'No. KTP / NIK', key: 'national_id', type: 'text' },
                        { label: 'Golongan Darah', key: 'blood_type', type: 'select', options: ['A','B','AB','O'] },
                        { label: 'Agama', key: 'religion', type: 'text' },
                        { label: 'Status Pernikahan', key: 'marital_status', type: 'select', options: ['SINGLE','MARRIED','DIVORCED','WIDOWED'] },
                        { label: 'Kewarganegaraan', key: 'nationality', type: 'text' },
                        { label: 'Alamat', key: 'address', type: 'textarea' },
                        { label: 'NPWP', key: 'tax_id', type: 'text' },
                        { label: 'BPJS Kesehatan', key: 'bpjs_kesehatan', type: 'text' },
                        { label: 'BPJS Ketenagakerjaan', key: 'bpjs_ketenagakerjaan', type: 'text' },
                      ].map(field => (
                        <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
                          {editMode ? (
                            field.type === 'select' ? (
                              <select value={personalForm[field.key] || ''} onChange={e => setPersonalForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm">
                                <option value="">-</option>
                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : field.type === 'textarea' ? (
                              <textarea value={personalForm[field.key] || ''} onChange={e => setPersonalForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
                            ) : (
                              <input type={field.type} value={personalForm[field.key] || ''} onChange={e => setPersonalForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                            )
                          ) : (
                            <p className="text-sm text-gray-800 py-2">{
                              field.type === 'date' ? fmtDate(selectedEmployee[field.key]) : (selectedEmployee[field.key] || '-')
                            }</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Employment Info */}
                    <h3 className="font-semibold text-gray-800 mt-6 mb-4">Informasi Kepegawaian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Departemen', key: 'department' },
                        { label: 'Jabatan', key: 'position' },
                        { label: 'Cabang', key: 'branch_name' },
                        { label: 'Job Grade', key: 'grade_name' },
                        { label: 'Organisasi', key: 'org_name' },
                        { label: 'Supervisor', key: 'supervisor_name' },
                        { label: 'Tipe Kontrak', key: 'contract_type' },
                        { label: 'Mulai Kontrak', key: 'contract_start', type: 'date' },
                        { label: 'Akhir Kontrak', key: 'contract_end', type: 'date' },
                        { label: 'Tanggal Bergabung', key: 'join_date', type: 'date' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
                          <p className="text-sm text-gray-800 py-2">{
                            field.type === 'date' ? fmtDate(selectedEmployee[field.key]) : (selectedEmployee[field.key] || '-')
                          }</p>
                        </div>
                      ))}
                    </div>

                    {/* Emergency Contact */}
                    <h3 className="font-semibold text-gray-800 mt-6 mb-4">Kontak Darurat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Nama', key: 'emergency_contact_name' },
                        { label: 'Hubungan', key: 'emergency_contact_relationship' },
                        { label: 'No. Telepon', key: 'emergency_contact_phone' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
                          {editMode ? (
                            <input type="text" value={personalForm[field.key] || ''} onChange={e => setPersonalForm((f: any) => ({ ...f, [field.key]: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm" />
                          ) : (
                            <p className="text-sm text-gray-800 py-2">{selectedEmployee[field.key] || '-'}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== FAMILY TAB ===== */}
                {detailTab === 'family' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Data Keluarga</h3>
                      <button onClick={() => openSubModal('family')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.families || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada data keluarga</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.families.map((f: any) => (
                          <div key={f.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{f.name}</p>
                                <p className="text-xs text-gray-500">{f.relationship} • {f.gender || '-'} • {fmtDate(f.date_of_birth)}</p>
                                {f.occupation && <p className="text-xs text-gray-400 mt-1">Pekerjaan: {f.occupation}</p>}
                                {f.phone_number && <p className="text-xs text-gray-400">Telp: {f.phone_number}</p>}
                                <div className="flex gap-2 mt-1">
                                  {f.is_emergency_contact && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full">Kontak Darurat</span>}
                                  {f.is_dependent && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full">Tanggungan</span>}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openSubModal('family', f)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('family', f.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== EDUCATION TAB ===== */}
                {detailTab === 'education' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Riwayat Pendidikan</h3>
                      <button onClick={() => openSubModal('education')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.educations || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada data pendidikan</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.educations.map((e: any) => (
                          <div key={e.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded font-medium">{e.level}</span>
                                  <p className="font-medium text-gray-800">{e.institution}</p>
                                  {e.is_highest && <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] rounded-full">Tertinggi</span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{e.major || '-'} {e.degree ? `(${e.degree})` : ''}</p>
                                <p className="text-xs text-gray-400">{e.start_year || '?'} - {e.end_year || 'sekarang'} {e.gpa ? `• IPK: ${e.gpa}` : ''}</p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openSubModal('education', e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('education', e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== CERTIFICATION TAB ===== */}
                {detailTab === 'certification' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Sertifikasi & Lisensi</h3>
                      <button onClick={() => openSubModal('certification')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.certifications || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada data sertifikasi</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.certifications.map((c: any) => (
                          <div key={c.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.issuing_organization || '-'}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Terbit: {fmtDate(c.issue_date)} {c.expiry_date ? `• Kadaluarsa: ${fmtDate(c.expiry_date)}` : '• Seumur Hidup'}
                                </p>
                                {c.credential_id && <p className="text-xs text-gray-400">ID: {c.credential_id}</p>}
                              </div>
                              <div className="flex items-center gap-2">
                                {c.expiry_date && new Date(c.expiry_date) < new Date() ? (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full">Expired</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded-full">Aktif</span>
                                )}
                                <button onClick={() => openSubModal('certification', c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('certification', c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== EXPERIENCE TAB ===== */}
                {detailTab === 'experience' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Pengalaman Kerja</h3>
                      <button onClick={() => openSubModal('experience')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.experiences || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada data pengalaman kerja</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.experiences.map((e: any) => (
                          <div key={e.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{e.position}</p>
                                <p className="text-sm text-gray-600">{e.company_name} {e.department ? `• ${e.department}` : ''}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {fmtDate(e.start_date)} - {e.is_current ? 'Sekarang' : fmtDate(e.end_date)}
                                </p>
                                {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openSubModal('experience', e)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('experience', e.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== DOCUMENTS TAB ===== */}
                {detailTab === 'documents' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Dokumen Digital</h3>
                      <button onClick={() => openSubModal('document')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.documents || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada dokumen</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedEmployee.documents.map((d: any) => (
                          <div key={d.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">{d.title}</p>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">{d.document_type}</span>
                                  {d.document_number && <p className="text-xs text-gray-400 mt-1">No: {d.document_number}</p>}
                                  <p className="text-xs text-gray-400">
                                    {d.issue_date && `Terbit: ${fmtDate(d.issue_date)}`}
                                    {d.expiry_date && ` • Exp: ${fmtDate(d.expiry_date)}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {statusBadge(d.status)}
                                <button onClick={() => openSubModal('document', d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('document', d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== CONTRACTS TAB ===== */}
                {detailTab === 'contracts' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Riwayat Kontrak</h3>
                      <button onClick={() => openSubModal('contract')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    {(selectedEmployee.contracts || []).length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Belum ada data kontrak</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.contracts.map((c: any) => (
                          <div key={c.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded font-medium">{c.contract_type}</span>
                                  {statusBadge(c.status)}
                                  {c.renewal_count > 0 && <span className="text-[10px] text-gray-400">Perpanjangan ke-{c.renewal_count}</span>}
                                </div>
                                {c.contract_number && <p className="text-xs text-gray-500 mt-1">No: {c.contract_number}</p>}
                                <p className="text-xs text-gray-400 mt-1">
                                  {fmtDate(c.start_date)} - {c.end_date ? fmtDate(c.end_date) : 'Tidak Terbatas'}
                                </p>
                                {c.position && <p className="text-xs text-gray-400">Posisi: {c.position} {c.department ? `• ${c.department}` : ''}</p>}
                                {c.salary && <p className="text-xs text-gray-400">Gaji: {fmtCurrency(c.salary)}</p>}
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openSubModal('contract', c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteSubData('contract', c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== SUB-DATA MODAL ===== */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSubModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">
                {subForm.id ? 'Edit' : 'Tambah'} {
                  subModalType === 'family' ? 'Data Keluarga' :
                  subModalType === 'education' ? 'Pendidikan' :
                  subModalType === 'certification' ? 'Sertifikasi' :
                  subModalType === 'experience' ? 'Pengalaman Kerja' :
                  subModalType === 'document' ? 'Dokumen' :
                  subModalType === 'contract' ? 'Kontrak' : ''
                }
              </h3>
              <button onClick={() => setShowSubModal(false)} className="p-1.5 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              {/* Dynamic form fields based on type */}
              {subModalType === 'family' && <>
                <div><label className="text-xs font-medium text-gray-500">Nama *</label>
                  <input type="text" value={subForm.name || ''} onChange={e => setSubForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Hubungan *</label>
                    <select value={subForm.relationship || ''} onChange={e => setSubForm((f: any) => ({ ...f, relationship: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                      <option value="">Pilih</option>
                      {['spouse','child','parent','sibling','other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select></div>
                  <div><label className="text-xs font-medium text-gray-500">Jenis Kelamin</label>
                    <select value={subForm.gender || ''} onChange={e => setSubForm((f: any) => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                      <option value="">-</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option>
                    </select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Lahir</label>
                    <input type="date" value={subForm.date_of_birth || ''} onChange={e => setSubForm((f: any) => ({ ...f, date_of_birth: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">No. Telepon</label>
                    <input type="text" value={subForm.phone_number || ''} onChange={e => setSubForm((f: any) => ({ ...f, phone_number: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-500">Pekerjaan</label>
                  <input type="text" value={subForm.occupation || ''} onChange={e => setSubForm((f: any) => ({ ...f, occupation: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={subForm.is_emergency_contact || false} onChange={e => setSubForm((f: any) => ({ ...f, is_emergency_contact: e.target.checked }))} /> Kontak Darurat</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={subForm.is_dependent || false} onChange={e => setSubForm((f: any) => ({ ...f, is_dependent: e.target.checked }))} /> Tanggungan</label>
                </div>
              </>}

              {subModalType === 'education' && <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Jenjang *</label>
                    <select value={subForm.level || ''} onChange={e => setSubForm((f: any) => ({ ...f, level: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                      <option value="">Pilih</option>
                      {['SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select></div>
                  <div><label className="text-xs font-medium text-gray-500">Gelar</label>
                    <input type="text" value={subForm.degree || ''} onChange={e => setSubForm((f: any) => ({ ...f, degree: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="S.Kom, S.E, dll" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-500">Institusi *</label>
                  <input type="text" value={subForm.institution || ''} onChange={e => setSubForm((f: any) => ({ ...f, institution: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div><label className="text-xs font-medium text-gray-500">Jurusan</label>
                  <input type="text" value={subForm.major || ''} onChange={e => setSubForm((f: any) => ({ ...f, major: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tahun Masuk</label>
                    <input type="number" value={subForm.start_year || ''} onChange={e => setSubForm((f: any) => ({ ...f, start_year: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Tahun Lulus</label>
                    <input type="number" value={subForm.end_year || ''} onChange={e => setSubForm((f: any) => ({ ...f, end_year: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">IPK</label>
                    <input type="number" step="0.01" value={subForm.gpa || ''} onChange={e => setSubForm((f: any) => ({ ...f, gpa: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={subForm.is_highest || false} onChange={e => setSubForm((f: any) => ({ ...f, is_highest: e.target.checked }))} /> Pendidikan Tertinggi</label>
              </>}

              {subModalType === 'certification' && <>
                <div><label className="text-xs font-medium text-gray-500">Nama Sertifikasi *</label>
                  <input type="text" value={subForm.name || ''} onChange={e => setSubForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div><label className="text-xs font-medium text-gray-500">Lembaga Penerbit</label>
                  <input type="text" value={subForm.issuing_organization || ''} onChange={e => setSubForm((f: any) => ({ ...f, issuing_organization: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div><label className="text-xs font-medium text-gray-500">Credential ID</label>
                  <input type="text" value={subForm.credential_id || ''} onChange={e => setSubForm((f: any) => ({ ...f, credential_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Terbit</label>
                    <input type="date" value={subForm.issue_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, issue_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Kadaluarsa</label>
                    <input type="date" value={subForm.expiry_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, expiry_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
              </>}

              {subModalType === 'experience' && <>
                <div><label className="text-xs font-medium text-gray-500">Nama Perusahaan *</label>
                  <input type="text" value={subForm.company_name || ''} onChange={e => setSubForm((f: any) => ({ ...f, company_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Posisi *</label>
                    <input type="text" value={subForm.position || ''} onChange={e => setSubForm((f: any) => ({ ...f, position: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Departemen</label>
                    <input type="text" value={subForm.department || ''} onChange={e => setSubForm((f: any) => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Mulai</label>
                    <input type="date" value={subForm.start_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Selesai</label>
                    <input type="date" value={subForm.end_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-500">Deskripsi</label>
                  <textarea value={subForm.description || ''} onChange={e => setSubForm((f: any) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" rows={2} /></div>
              </>}

              {subModalType === 'document' && <>
                <div><label className="text-xs font-medium text-gray-500">Judul Dokumen *</label>
                  <input type="text" value={subForm.title || ''} onChange={e => setSubForm((f: any) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tipe Dokumen *</label>
                    <select value={subForm.document_type || ''} onChange={e => setSubForm((f: any) => ({ ...f, document_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                      <option value="">Pilih</option>
                      {['KONTRAK_KERJA','PKWT','PKWTT','NDA','SP','SK_PENGANGKATAN','SK_MUTASI','SK_PROMOSI','SURAT_REFERENSI','KTP','KK','NPWP','BPJS','IJAZAH','SERTIFIKAT','SIM','PASPOR','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <div><label className="text-xs font-medium text-gray-500">No. Dokumen</label>
                    <input type="text" value={subForm.document_number || ''} onChange={e => setSubForm((f: any) => ({ ...f, document_number: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Terbit</label>
                    <input type="date" value={subForm.issue_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, issue_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Kadaluarsa</label>
                    <input type="date" value={subForm.expiry_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, expiry_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-500">Deskripsi</label>
                  <textarea value={subForm.description || ''} onChange={e => setSubForm((f: any) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" rows={2} /></div>
                <div><label className="text-xs font-medium text-gray-500">Ditandatangani Oleh</label>
                  <input type="text" value={subForm.signed_by || ''} onChange={e => setSubForm((f: any) => ({ ...f, signed_by: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
              </>}

              {subModalType === 'contract' && <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tipe Kontrak *</label>
                    <select value={subForm.contract_type || 'PKWTT'} onChange={e => setSubForm((f: any) => ({ ...f, contract_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                      {['PKWT','PKWTT','MAGANG','FREELANCE'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                  <div><label className="text-xs font-medium text-gray-500">No. Kontrak</label>
                    <input type="text" value={subForm.contract_number || ''} onChange={e => setSubForm((f: any) => ({ ...f, contract_number: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Mulai *</label>
                    <input type="date" value={subForm.start_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, start_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Tanggal Berakhir</label>
                    <input type="date" value={subForm.end_date || ''} onChange={e => setSubForm((f: any) => ({ ...f, end_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-gray-500">Posisi</label>
                    <input type="text" value={subForm.position || ''} onChange={e => setSubForm((f: any) => ({ ...f, position: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                  <div><label className="text-xs font-medium text-gray-500">Gaji</label>
                    <input type="number" value={subForm.salary || ''} onChange={e => setSubForm((f: any) => ({ ...f, salary: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
                </div>
                <div><label className="text-xs font-medium text-gray-500">Catatan</label>
                  <textarea value={subForm.notes || ''} onChange={e => setSubForm((f: any) => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" rows={2} /></div>
              </>}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Batal</button>
              <button onClick={saveSubData} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </HQLayout>
  );
}
