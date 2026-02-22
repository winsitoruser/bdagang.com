import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaHistory, FaSearch, FaFilter, FaDownload, 
  FaEye, FaPrint, FaCalendar, FaShoppingCart, FaSpinner,
  FaChevronLeft, FaChevronRight, FaTimes, FaFileExcel, FaFilePdf
} from 'react-icons/fa';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Transaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  customer: { id: string; name: string; phone: string } | null;
  cashier: { id: string; name: string };
  itemCount: number;
  totalItems: number;
}

interface Stats {
  totalTransactions: number;
  totalSales: number;
  avgTransaction: number;
  completedSales: number;
  voidedCount: number;
  refundedCount: number;
}

const HistoryPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    paymentMethod: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // WebSocket for real-time updates
  const handleRealtimeUpdate = useCallback((message: any) => {
    if (message.event === 'pos:transaction:complete' || message.event === 'pos:transaction:void') {
      fetchTransactions();
    }
  }, []);

  const { isConnected } = useWebSocket({
    branchId: session?.user?.branchId || 'default',
    role: 'pos-history',
    events: ['pos:transaction:complete', 'pos:transaction:void'],
    onMessage: handleRealtimeUpdate
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        paymentMethod: filters.paymentMethod,
        search: searchTerm,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/pos/transactions/history?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions || []);
        setStats(data.data.stats);
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Riwayat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleExportExcel = () => {
    const data = transactions.map(t => ({
      'No. Transaksi': t.transactionNumber,
      'Tanggal': new Date(t.transactionDate).toLocaleString('id-ID'),
      'Kasir': t.cashier?.name || '-',
      'Pelanggan': t.customer?.name || 'Walk-in',
      'Items': t.totalItems,
      'Total': t.totalAmount,
      'Pembayaran': t.paymentMethod,
      'Status': t.status
    }));
    exportToExcel(data, 'transaction-history', 'Riwayat Transaksi');
  };

  const handleExportPDF = () => {
    const data = transactions.map(t => ({
      'No. Transaksi': t.transactionNumber,
      'Tanggal': new Date(t.transactionDate).toLocaleString('id-ID'),
      'Kasir': t.cashier?.name || '-',
      'Pelanggan': t.customer?.name || 'Walk-in',
      'Total': formatCurrency(t.totalAmount),
      'Status': t.status
    }));
    exportToPDF(data, {
      title: 'Riwayat Transaksi',
      fileName: 'transaction-history',
      columns: ['No. Transaksi', 'Tanggal', 'Kasir', 'Pelanggan', 'Total', 'Status']
    });
  };

  const viewTransactionDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/pos/transactions/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedTransaction(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    }
  };

  const handlePrint = (id: string) => {
    window.open(`/api/pos/receipts/${id}/print`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      voided: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      Cash: 'bg-green-50 text-green-700 border-green-200',
      Card: 'bg-blue-50 text-blue-700 border-blue-200',
      QRIS: 'bg-purple-50 text-purple-700 border-purple-200',
      'E-Wallet': 'bg-orange-50 text-orange-700 border-orange-200',
      Transfer: 'bg-cyan-50 text-cyan-700 border-cyan-200'
    };
    return styles[method] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Riwayat Transaksi | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Riwayat Transaksi</h1>
              <p className="text-pink-100">
                Lihat semua riwayat transaksi lengkap
              </p>
            </div>
            <FaHistory className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p>
            <span className="text-sm text-gray-600">Periode dipilih</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.totalSales || 0)}
            </p>
            <span className="text-sm text-green-600 font-medium">Periode dipilih</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.avgTransaction || 0)}
            </p>
            <span className="text-sm text-gray-600">Per transaksi</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Void/Refund</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.voidedCount || 0) + (stats?.refundedCount || 0)}
            </p>
            <span className="text-sm text-gray-600">Transaksi</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID transaksi, pelanggan, kasir..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Selesai</option>
                <option value="voided">Void</option>
                <option value="refunded">Refund</option>
              </select>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaFileExcel />
                <span>Excel</span>
              </button>
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaFilePdf />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
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
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <FaSpinner className="animate-spin h-8 w-8 mx-auto text-pink-600" />
                      <p className="mt-2 text-gray-500">Memuat data...</p>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada transaksi ditemukan
                    </td>
                  </tr>
                ) : transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-pink-600">{transaction.transactionNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(transaction.transactionDate).toLocaleDateString('id-ID')}</div>
                      <div className="text-sm text-gray-500">{new Date(transaction.transactionDate).toLocaleTimeString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.cashier?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.customer?.name || 'Walk-in'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.totalItems} items</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPaymentMethodBadge(transaction.paymentMethod)}`}>
                        {transaction.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                          <FaEye />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800" title="Cetak">
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
