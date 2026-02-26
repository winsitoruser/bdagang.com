import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { 
  Users, UserCheck, UserX, Clock, TrendingUp, Award, 
  Calendar, BarChart3, Target, Star, AlertCircle,
  Building2, ChevronRight, Filter, Download, Search,
  Eye, Edit, MoreVertical
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branchId: string;
  branchName: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  performance: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    kpiAchievement: number;
    attendance: number;
    rating: number;
  };
  manager?: string;
}

interface DepartmentStats {
  department: string;
  totalEmployees: number;
  activeEmployees: number;
  avgPerformance: number;
  avgAttendance: number;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@bedagang.com', phone: '081234567890', position: 'Branch Manager', department: 'Operations', branchId: '1', branchName: 'Cabang Pusat Jakarta', joinDate: '2023-06-15', status: 'active', performance: { score: 92, trend: 'up', kpiAchievement: 104, attendance: 98, rating: 4.8 }, manager: 'Super Admin' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@bedagang.com', phone: '082345678901', position: 'Branch Manager', department: 'Operations', branchId: '2', branchName: 'Cabang Bandung', joinDate: '2023-08-01', status: 'active', performance: { score: 88, trend: 'up', kpiAchievement: 102, attendance: 96, rating: 4.5 }, manager: 'Super Admin' },
  { id: '3', name: 'Budi Santoso', email: 'budi@bedagang.com', phone: '083456789012', position: 'Branch Manager', department: 'Operations', branchId: '3', branchName: 'Cabang Surabaya', joinDate: '2023-09-10', status: 'active', performance: { score: 78, trend: 'down', kpiAchievement: 92, attendance: 94, rating: 4.0 }, manager: 'Super Admin' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi@bedagang.com', phone: '084567890123', position: 'Supervisor', department: 'Operations', branchId: '1', branchName: 'Cabang Pusat Jakarta', joinDate: '2024-01-15', status: 'active', performance: { score: 85, trend: 'stable', kpiAchievement: 98, attendance: 97, rating: 4.3 }, manager: 'Ahmad Wijaya' },
  { id: '5', name: 'Eko Prasetyo', email: 'eko@bedagang.com', phone: '085678901234', position: 'Kasir Senior', department: 'Sales', branchId: '1', branchName: 'Cabang Pusat Jakarta', joinDate: '2024-02-01', status: 'active', performance: { score: 90, trend: 'up', kpiAchievement: 110, attendance: 99, rating: 4.6 }, manager: 'Dewi Lestari' },
  { id: '6', name: 'Fitri Handayani', email: 'fitri@bedagang.com', phone: '086789012345', position: 'Kasir', department: 'Sales', branchId: '2', branchName: 'Cabang Bandung', joinDate: '2024-03-01', status: 'active', performance: { score: 82, trend: 'up', kpiAchievement: 95, attendance: 95, rating: 4.2 }, manager: 'Siti Rahayu' },
  { id: '7', name: 'Gunawan', email: 'gunawan@bedagang.com', phone: '087890123456', position: 'Staff Gudang', department: 'Warehouse', branchId: '6', branchName: 'Gudang Pusat', joinDate: '2024-01-20', status: 'active', performance: { score: 75, trend: 'stable', kpiAchievement: 88, attendance: 92, rating: 3.8 }, manager: 'Admin HQ' },
  { id: '8', name: 'Hendra Kusuma', email: 'hendra@bedagang.com', phone: '088901234567', position: 'Kasir', department: 'Sales', branchId: '3', branchName: 'Cabang Surabaya', joinDate: '2024-04-01', status: 'on_leave', performance: { score: 70, trend: 'down', kpiAchievement: 85, attendance: 88, rating: 3.5 }, manager: 'Budi Santoso' },
];

const mockDepartmentStats: DepartmentStats[] = [
  { department: 'Operations', totalEmployees: 15, activeEmployees: 14, avgPerformance: 86, avgAttendance: 96 },
  { department: 'Sales', totalEmployees: 45, activeEmployees: 43, avgPerformance: 84, avgAttendance: 95 },
  { department: 'Warehouse', totalEmployees: 12, activeEmployees: 12, avgPerformance: 78, avgAttendance: 93 },
  { department: 'Finance', totalEmployees: 5, activeEmployees: 5, avgPerformance: 90, avgAttendance: 98 },
  { department: 'HR', totalEmployees: 3, activeEmployees: 3, avgPerformance: 88, avgAttendance: 97 },
];

export default function HRISDashboard() {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/hris/employees?limit=100&offset=0');
      if (response.ok) {
        const result = await response.json();
        const employeeData = result.data || [];
        
        setEmployees(employeeData.length > 0 ? employeeData : mockEmployees);
        
        if (employeeData.length > 0) {
          const departments = ['Operations', 'Sales', 'Warehouse', 'Finance', 'HR'];
          const stats = departments.map(dept => {
            const deptEmployees = employeeData.filter((e: Employee) => e.department === dept);
            return {
              department: dept,
              totalEmployees: deptEmployees.length,
              activeEmployees: deptEmployees.filter((e: Employee) => e.status === 'active').length,
              avgPerformance: deptEmployees.length > 0 
                ? Math.round(deptEmployees.reduce((sum: number, e: Employee) => sum + e.performance.score, 0) / deptEmployees.length)
                : 0,
              avgAttendance: deptEmployees.length > 0
                ? Math.round(deptEmployees.reduce((sum: number, e: Employee) => sum + e.performance.attendance, 0) / deptEmployees.length)
                : 0
            };
          });
          setDepartmentStats(stats);
        } else {
          setDepartmentStats(mockDepartmentStats);
        }
      } else {
        setEmployees(mockEmployees);
        setDepartmentStats(mockDepartmentStats);
      }
    } catch (error) {
      console.error('Error fetching HRIS data:', error);
      setEmployees(mockEmployees);
      setDepartmentStats(mockDepartmentStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'on_leave').length;
  const avgPerformance = employees.reduce((sum, e) => sum + e.performance.score, 0) / totalEmployees || 0;
  const avgKPI = employees.reduce((sum, e) => sum + e.performance.kpiAchievement, 0) / totalEmployees || 0;
  const topPerformers = employees.filter(e => e.performance.score >= 85).length;

  const filteredEmployees = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       e.branchName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = departmentFilter === 'all' || e.department === departmentFilter;
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Aktif</span>;
      case 'inactive': return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Tidak Aktif</span>;
      case 'on_leave': return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Cuti</span>;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <HQLayout title="HRIS Dashboard" subtitle="Human Resource Information System - Monitoring Kinerja Karyawan">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>
                <p className="text-xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif</p>
                <p className="text-xl font-bold">{activeEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cuti</p>
                <p className="text-xl font-bold">{onLeaveEmployees}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Performance</p>
                <p className="text-xl font-bold">{avgPerformance.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. KPI</p>
                <p className="text-xl font-bold">{avgKPI.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top Performers</p>
                <p className="text-xl font-bold">{topPerformers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/hq/hris/kpi" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">KPI Dashboard</p>
                <p className="text-sm text-blue-100">Monitor target & pencapaian</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
          <a href="/hq/hris/attendance" className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Kehadiran</p>
                <p className="text-sm text-green-100">Rekap absensi karyawan</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
          <a href="/hq/hris/performance" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Performance Review</p>
                <p className="text-sm text-purple-100">Evaluasi kinerja</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
          <a href="/hq/hris/reports" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Laporan HR</p>
                <p className="text-sm text-orange-100">Analytics & insights</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
        </div>

        {/* Department Stats */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Statistik per Departemen</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {departmentStats.map((dept) => (
              <div key={dept.department} className="border rounded-lg p-4 hover:shadow-md transition-all">
                <h4 className="font-medium text-gray-900">{dept.department}</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Karyawan:</span>
                    <span className="font-medium">{dept.activeEmployees}/{dept.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Performance:</span>
                    <span className={`font-medium ${dept.avgPerformance >= 85 ? 'text-green-600' : dept.avgPerformance >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {dept.avgPerformance}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kehadiran:</span>
                    <span className="font-medium">{dept.avgAttendance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <h3 className="text-lg font-semibold">Daftar Karyawan</h3>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari karyawan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64"
                  />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Semua Departemen</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="on_leave">Cuti</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">KPI</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kehadiran</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{employee.position}</p>
                      <p className="text-xs text-gray-500">{employee.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{employee.branchName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(employee.performance.score)}`}>
                          {employee.performance.score}%
                        </span>
                        {getTrendIcon(employee.performance.trend)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${employee.performance.kpiAchievement >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {employee.performance.kpiAchievement}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm">{employee.performance.attendance}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{employee.performance.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => { setSelectedEmployee(employee); setShowDetailModal(true); }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedEmployee?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '-'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedEmployee?.name}</h3>
                      <p className="text-gray-500">{selectedEmployee?.position} - {selectedEmployee?.department}</p>
                      {getStatusBadge(selectedEmployee?.status)}
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedEmployee?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-medium">{selectedEmployee?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cabang</p>
                    <p className="font-medium">{selectedEmployee?.branchName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                    <p className="font-medium">{selectedEmployee?.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Atasan</p>
                    <p className="font-medium">{selectedEmployee?.manager || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedEmployee?.performance?.score || 0}%</p>
                      <p className="text-sm text-gray-500">Performance Score</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedEmployee?.performance?.kpiAchievement || 0}%</p>
                      <p className="text-sm text-gray-500">KPI Achievement</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedEmployee?.performance?.attendance || 0}%</p>
                      <p className="text-sm text-gray-500">Attendance</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <p className="text-2xl font-bold text-yellow-600">{selectedEmployee?.performance?.rating || 0}</p>
                      </div>
                      <p className="text-sm text-gray-500">Rating</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Lihat Detail KPI</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Karyawan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
