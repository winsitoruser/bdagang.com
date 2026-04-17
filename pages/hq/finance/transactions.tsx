import { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { useTranslation } from '@/lib/i18n';
import { CanAccess, PageGuard } from '../../../components/permissions';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  Building2,
  Tag,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import TransactionFormModal from '../../../components/hq/finance/TransactionFormModal';

const MOCK_TRANSACTIONS = [
  { id: 'txn1', transactionNumber: 'TXN-2026-0312-001', transactionDate: '2026-03-12', type: 'income', description: 'Penjualan Harian Cabang Jakarta', amount: 48500000, status: 'completed', branch: 'Kantor Pusat Jakarta', category: 'Sales', account_code: 'REV-001' },
  { id: 'txn2', transactionNumber: 'TXN-2026-0312-002', transactionDate: '2026-03-12', type: 'expense', description: 'Pembelian Bahan Baku Kopi', amount: 15200000, status: 'completed', branch: 'Gudang Pusat Bekasi', category: 'COGS', account_code: 'EXP-001' },
  { id: 'txn3', transactionNumber: 'TXN-2026-0312-003', transactionDate: '2026-03-12', type: 'income', description: 'Penjualan Harian Cabang Bandung', amount: 35200000, status: 'completed', branch: 'Cabang Bandung', category: 'Sales', account_code: 'REV-001' },
  { id: 'txn4', transactionNumber: 'TXN-2026-0311-001', transactionDate: '2026-03-11', type: 'expense', description: 'Gaji Karyawan Maret 2026', amount: 125000000, status: 'pending', branch: 'All', category: 'Payroll', account_code: 'EXP-002' },
  { id: 'txn5', transactionNumber: 'TXN-2026-0311-002', transactionDate: '2026-03-11', type: 'transfer', description: 'Transfer Dana ke Cabang Bali', amount: 50000000, status: 'completed', branch: 'Cabang Bali', category: 'Transfer', account_code: 'TRF-001' },
  { id: 'txn6', transactionNumber: 'TXN-2026-0311-003', transactionDate: '2026-03-11', type: 'income', description: 'Penjualan Harian Cabang Surabaya', amount: 29800000, status: 'completed', branch: 'Cabang Surabaya', category: 'Sales', account_code: 'REV-001' },
  { id: 'txn7', transactionNumber: 'TXN-2026-0310-001', transactionDate: '2026-03-10', type: 'expense', description: 'Biaya Listrik & Air Maret', amount: 18500000, status: 'completed', branch: 'All', category: 'Utilities', account_code: 'EXP-003' },
  { id: 'txn8', transactionNumber: 'TXN-2026-0310-002', transactionDate: '2026-03-10', type: 'expense', description: 'Biaya Marketing Digital', amount: 8500000, status: 'approved', branch: 'Kantor Pusat Jakarta', category: 'Marketing', account_code: 'EXP-004' },
];

const MOCK_TXN_STATS = { totalIncome: 113500000, totalExpense: 167200000, totalTransfer: 50000000, netCashFlow: -53700000 };

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>(MOCK_TRANSACTIONS);
  const [branches, setBranches] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Stats
  const [stats, setStats] = useState(MOCK_TXN_STATS);

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchBranches();
    fetchAccounts();
  }, [typeFilter, statusFilter, branchFilter, dateRange, pagination.offset]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
      const params = new URLSearchParams({
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: pagination.limit.toString(),
        page: currentPage.toString()
      });

      const response = await fetch(`/api/hq/finance/transactions?${params}`);
      const json = await response.json();
      const rawData = json.data || json;
      const paginationData = json.pagination || json.meta || {};

      if (response.ok) {
        const rawList = Array.isArray(rawData) ? rawData : (rawData.transactions || rawData || []);
        // Normalize DB column names to frontend field names
        const txnList = rawList.map((t: any) => ({
          ...t,
          type: t.type || t.transactionType || '',
          transactionNumber: t.transactionNumber || '',
          transactionDate: t.transactionDate || '',
          amount: parseFloat(t.amount || 0),
        }));
        setTransactions(txnList);
        setPagination(prev => ({ ...prev, total: paginationData.total || txnList.length || 0 }));
        calculateStats(txnList);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions(MOCK_TRANSACTIONS);
      setStats(MOCK_TXN_STATS);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/hq/branches');
      const json = await response.json();
      const bp = json.data || json;
      if (response.ok) {
        setBranches(bp.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/hq/finance/accounts');
      const json2 = await response.json();
      const ap = json2.data || json2;
      if (response.ok) {
        setAccounts(ap.accounts || ap.receivables || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const calculateStats = (txns: any[]) => {
    const income = txns.filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = txns.filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const transfer = txns.filter(t => t.type === 'transfer' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    setStats({
      totalIncome: income,
      totalExpense: expense,
      totalTransfer: transfer,
      netCashFlow: income - expense
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchTransactions();
  };

  const handleCreateTransaction = async (data: any) => {
    try {
      const response = await fetch('/api/hq/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType: data.type,
          accountId: data.accountId || null,
          category: data.category || null,
          amount: data.amount,
          description: data.description,
          referenceType: data.reference ? 'manual' : null,
          paymentMethod: data.paymentMethod || null,
          contactName: data.contactName || null,
          notes: data.notes || null,
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedTransaction(null);
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (data: any) => {
    try {
      const response = await fetch(`/api/hq/finance/transactions?id=${selectedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          updatedBy: 'current-user' // Replace with actual user ID from session
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedTransaction(null);
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this transaction?')) return;

    try {
      const response = await fetch(`/api/hq/finance/transactions?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Number', 'Type', 'Category', 'Branch', 'Amount', 'Status', 'Description'],
      ...transactions.map(t => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.transactionNumber,
        t.type,
        t.category,
        t.branch?.code || 'N/A',
        t.amount,
        t.status,
        t.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600 bg-green-50';
      case 'expense': return 'text-red-600 bg-red-50';
      case 'transfer': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <PageGuard
      anyPermission={['finance.view', 'finance.*', 'finance_transactions.view']}
      title="Transaksi Finance"
    >
    <HQLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('finance.trxTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('finance.trxSubtitle')}</p>
          </div>
          <CanAccess anyPermission={['finance_transactions.create', 'finance.*']}>
          <button
            onClick={() => {
              setSelectedTransaction(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {t('finance.newTransaction')}
          </button>
          </CanAccess>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">{t('finance.totalIncome')}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalIncome)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">{t('finance.totalExpense')}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalExpense)}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t('finance.totalTransfer')}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalTransfer)}</p>
              </div>
              <ArrowUpDown className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-br ${stats.netCashFlow >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{t('finance.netCashFlow')}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.netCashFlow)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-white/60" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                {t('finance.search')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('finance.trxSearch')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                {t('finance.type')}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('finance.allTypes')}</option>
                <option value="income">{t('finance.income')}</option>
                <option value="expense">{t('finance.expense')}</option>
                <option value="transfer">{t('finance.transfer')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                {t('finance.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('finance.allStatus')}</option>
                <option value="draft">{t('finance.draft')}</option>
                <option value="pending">{t('finance.pending')}</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Branch
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3">Memuat transaksi...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p>Tidak ada transaksi ditemukan</p>
                      <p className="text-sm mt-1">Coba sesuaikan filter atau buat transaksi baru</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.transactionDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.transactionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.branch?.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <CanAccess anyPermission={['finance_transactions.update', 'finance.*']}>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Ubah"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </CanAccess>
                          <CanAccess anyPermission={['finance_transactions.delete', 'finance.*']}>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                              disabled={transaction.status === 'completed'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </CanAccess>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={pagination.offset === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null);
        }}
        onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
        transaction={selectedTransaction}
        branches={branches}
        accounts={accounts}
      />
    </HQLayout>
    </PageGuard>
  );
}
