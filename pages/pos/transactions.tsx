import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { 
  FaShoppingCart, FaSearch, FaFilter, FaDownload, 
  FaEye, FaPrint, FaCalendar, FaSpinner
} from 'react-icons/fa';

const TransactionsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const MOCK_POS_TXS = [
    { id: 'ptx1', transactionNumber: 'TRX-20260315-001', date: '2026-03-15T09:15:00', totalAmount: 185000, paymentMethod: 'cash', status: 'completed', cashier: 'Budi S.', itemCount: 3 },
    { id: 'ptx2', transactionNumber: 'TRX-20260315-002', date: '2026-03-15T09:45:00', totalAmount: 250000, paymentMethod: 'qris', status: 'completed', cashier: 'Budi S.', itemCount: 5 },
    { id: 'ptx3', transactionNumber: 'TRX-20260315-003', date: '2026-03-15T10:20:00', totalAmount: 95000, paymentMethod: 'cash', status: 'completed', cashier: 'Siti R.', itemCount: 2 },
  ];
  const MOCK_POS_TX_STATS = { totalTransactions: 85, totalSales: 18500000, avgTransaction: 217647, completedCount: 83, voidedCount: 2 };
  const [transactions, setTransactions] = useState<any[]>(MOCK_POS_TXS);
  const [stats, setStats] = useState<any>(MOCK_POS_TX_STATS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
      fetchStats();
    }
  }, [session, page, searchTerm, filterStatus, filterPayment, startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        status: filterStatus,
        paymentMethod: filterPayment
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/pos/transactions/list?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions || []);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to fetch transactions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions(MOCK_POS_TXS);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pos/transactions/stats?period=today');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(MOCK_POS_TX_STATS);
    }
  };

  const viewTransactionDetail = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/pos/transactions/${transactionId}/detail`);
      const data = await response.json();

      if (data.success) {
        setSelectedTransaction(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    }
  };

  const handlePrint = (transaction: any) => {
    window.print();
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        search: searchTerm,
        status: filterStatus,
        paymentMethod: filterPayment
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // Open download in new window
      window.open(`/api/pos/transactions/export?${params.toString()}`, '_blank');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Transaksi...</p>
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
        <title>Transaksi Penjualan | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transaksi Penjualan</h1>
              <p className="text-blue-100">
                Kelola dan pantau semua transaksi penjualan
              </p>
            </div>
            <FaShoppingCart className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.overall?.totalTransactions || 0}</p>
            {stats?.growth && (
              <span className={`text-sm font-medium ${stats.growth.transactionsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.growth.transactionsGrowth >= 0 ? '+' : ''}{stats.growth.transactionsGrowth.toFixed(1)}% dari kemarin
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.overall?.totalSales || 0)}</p>
            {stats?.growth && (
              <span className={`text-sm font-medium ${stats.growth.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.growth.salesGrowth >= 0 ? '+' : ''}{stats.growth.salesGrowth.toFixed(1)}% dari kemarin
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.overall?.averageTransaction || 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Produk Terjual</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.overall?.totalItemsSold || 0}</p>
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
                  placeholder="Cari ID transaksi, pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaCalendar className="text-gray-600" />
                <span className="text-gray-700">Filter Tanggal</span>
                {(startDate || endDate) && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Aktif</span>
                )}
              </button>
              <button 
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-600" />
                <span className="text-gray-700">Filter</span>
                {(filterStatus !== 'all' || filterPayment !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Aktif</span>
                )}
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload />
                <span>Ekspor CSV</span>
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
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaSpinner className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-gray-500">Memuat transaksi...</p>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Tidak ada transaksi</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{transaction.transactionNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(transaction.date).toLocaleDateString('id-ID')}</div>
                        <div className="text-sm text-gray-500">{new Date(transaction.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.customer.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.items} produk</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => viewTransactionDetail(transaction.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handlePrint(transaction)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FaPrint />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Filter Transaksi</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="completed">Selesai</option>
                    <option value="pending">Tertunda</option>
                    <option value="cancelled">Dibatalkan</option>
                    <option value="refunded">Dikembalikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Metode</option>
                    <option value="Cash">Tunai</option>
                    <option value="Card">Kartu</option>
                    <option value="Transfer">Transfer</option>
                    <option value="QRIS">QRIS</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPayment('all');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atur Ulang
                </button>
                <button
                  onClick={() => {
                    setShowFilterModal(false);
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Filter Tanggal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Filter Cepat:</strong>
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setStartDate(today);
                        setEndDate(today);
                      }}
                      className="px-3 py-1 bg-white border border-blue-200 rounded text-sm hover:bg-blue-50"
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        setStartDate(weekAgo.toISOString().split('T')[0]);
                        setEndDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1 bg-white border border-blue-200 rounded text-sm hover:bg-blue-50"
                    >
                      7 Hari
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        setStartDate(monthAgo.toISOString().split('T')[0]);
                        setEndDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1 bg-white border border-blue-200 rounded text-sm hover:bg-blue-50"
                    >
                      30 Hari
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atur Ulang
                </button>
                <button
                  onClick={() => {
                    setShowDateModal(false);
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
