import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { 
  FaClock, FaPlay, FaStop, FaUser, FaMoneyBillWave,
  FaCalendar, FaDownload, FaEye, FaArrowLeft, FaFilter
} from 'react-icons/fa';
import StartShiftModal from '@/components/pos/StartShiftModal';
import CloseShiftModal from '@/components/pos/CloseShiftModal';

const ShiftsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const MOCK_SHIFTS = [
    { id: 'sh1', shiftNumber: 'SH-20260315-001', employee: { name: 'Budi Santoso' }, startTime: '2026-03-15T08:00:00', endTime: '2026-03-15T16:00:00', status: 'closed', totalSales: 8500000, transactionCount: 42, openingCash: 500000, closingCash: 9000000 },
    { id: 'sh2', shiftNumber: 'SH-20260315-002', employee: { name: 'Siti Rahayu' }, startTime: '2026-03-15T14:00:00', endTime: null, status: 'open', totalSales: 5200000, transactionCount: 28, openingCash: 500000, closingCash: 0 },
  ];
  const MOCK_SHIFT_STATS = { todayShifts: 2, totalSales: 13700000, activeStaff: 1, monthlyShifts: 45 };
  const [shifts, setShifts] = useState<any[]>(MOCK_SHIFTS);
  const [currentShift, setCurrentShift] = useState<any>(MOCK_SHIFTS[1]);
  const [stats, setStats] = useState(MOCK_SHIFT_STATS);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    cashier: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchShifts();
      fetchCurrentShift();
      fetchStats();
    }
  }, [session, filters, pagination.page]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const offset = (pagination.page - 1) * pagination.limit;
      let url = `/api/pos/shifts?limit=${pagination.limit}&offset=${offset}`;
      
      if (filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }
      if (filters.dateFrom) {
        url += `&date=${filters.dateFrom}`;
      }
      if (filters.dateTo) {
        url += `&dateTo=${filters.dateTo}`;
      }
      if (filters.cashier) {
        url += `&employeeId=${filters.cashier}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Failed to fetch shifts');
        setShifts([]);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON');
        setShifts([]);
        return;
      }

      const data = await response.json();
      
      if (data.shifts) {
        setShifts(data.shifts);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0
        }));
      } else {
        setShifts([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setShifts(MOCK_SHIFTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentShift = async () => {
    try {
      const response = await fetch('/api/pos/shifts/status');
      
      if (!response.ok) {
        setCurrentShift(null);
        return;
      }

      const data = await response.json();
      
      if (data.shift) {
        setCurrentShift(data.shift);
      } else {
        setCurrentShift(null);
      }
    } catch (error) {
      console.error('Error fetching current shift:', error);
      setCurrentShift(MOCK_SHIFTS[1]);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/pos/shifts?date=${today}`);
      
      if (response.ok) {
        const data = await response.json();
        const todayShifts = data.shifts || [];
        
        setStats({
          todayShifts: todayShifts.length,
          totalSales: todayShifts.reduce((sum: number, s: any) => sum + (s.totalSales || 0), 0),
          activeStaff: todayShifts.filter((s: any) => s.status === 'open').length,
          monthlyShifts: data.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(MOCK_SHIFT_STATS);
    }
  };

  const handleStartShiftSuccess = () => {
    fetchShifts();
    fetchCurrentShift();
    fetchStats();
  };

  const handleCloseShiftSuccess = () => {
    fetchShifts();
    fetchCurrentShift();
    fetchStats();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let url = '/api/pos/shifts/export?format=excel';
      
      if (filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }
      if (filters.dateFrom) {
        url += `&dateFrom=${filters.dateFrom}`;
      }
      if (filters.dateTo) {
        url += `&dateTo=${filters.dateTo}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        alert('Gagal export data');
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `shifts-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
      alert('Data berhasil di-export!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Terjadi kesalahan saat export');
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      cashier: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Shift...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Riwayat Shift | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/pos')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Kembali ke POS"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Riwayat Shift</h1>
              <p className="text-red-100">
                Kelola shift kasir dan handover
              </p>
            </div>
            <FaClock className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Current Shift Status */}
        {currentShift && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaPlay className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-green-100">Shift Aktif</p>
                  <p className="text-xl font-bold">{currentShift.opener?.name || 'N/A'} - Shift {currentShift.shiftName}</p>
                  <p className="text-sm text-green-100">Dimulai: {currentShift.startTime} | Modal Awal: Rp {(currentShift.initialCashAmount || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCloseModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
              >
                <FaStop />
                <span>Tutup Shift</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Hari Ini</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayShifts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Total Penjualan</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">Rp {(stats.totalSales / 1000000).toFixed(1)} Jt</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUser className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Kasir Aktif</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaCalendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Bulan Ini</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.monthlyShifts}</p>
          </div>
        </div>

        {/* Actions */}
        {!currentShift && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak Ada Shift Aktif</h3>
                <p className="text-sm text-gray-600">Mulai shift baru untuk memulai transaksi</p>
              </div>
              <button 
                onClick={() => setShowStartModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <FaPlay />
                <span>Mulai Shift Baru</span>
              </button>
            </div>
          </div>
        )}

        {/* Shift History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Shift</h2>
              <button 
                onClick={handleExport}
                disabled={exporting || shifts.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FaDownload className={exporting ? 'animate-bounce' : ''} />
                <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
              </button>
            </div>
            
            {/* Filters */}
            <div className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="open">Aktif</option>
                  <option value="closed">Selesai</option>
                </select>
                
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Dari Tanggal"
                />
                
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Sampai Tanggal"
                />
                
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
              
              {/* Filter Summary */}
              {(filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Filter aktif:</span>
                  {filters.status !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Status: {filters.status === 'open' ? 'Aktif' : 'Selesai'}
                    </span>
                  )}
                  {filters.dateFrom && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Dari: {filters.dateFrom}
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      Sampai: {filters.dateTo}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modal Awal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modal Akhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mb-2"></div>
                        <p className="text-gray-500">Memuat data shift...</p>
                      </div>
                    </td>
                  </tr>
                ) : shifts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <p className="text-gray-500">Belum ada data shift</p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">{shift.id?.substring(0, 8) || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-900">{shift.opener?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.shiftDate || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.startTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.endTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(shift.initialCashAmount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {shift.finalCashAmount ? formatCurrency(shift.finalCashAmount) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.totalTransactions || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shift.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {shift.status === 'open' ? 'Aktif' : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && shifts.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} shift
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg ${
                            pagination.page === pageNum
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StartShiftModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSuccess={handleStartShiftSuccess}
      />

      <CloseShiftModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onSuccess={handleCloseShiftSuccess}
        shift={currentShift}
      />
    </DashboardLayout>
  );
};

export default ShiftsPage;
