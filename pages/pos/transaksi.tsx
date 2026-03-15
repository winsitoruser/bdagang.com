import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  FaCalendarAlt, FaDownload, FaFilter, FaPrint, FaSearch, 
  FaSort, FaSortDown, FaSortUp, FaArrowUp, FaArrowDown, 
  FaReceipt, FaMoneyBillWave, FaCreditCard, FaQrcode, FaWallet,
  FaUser, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaClock,
  FaBars, FaEye, FaTrash, FaEdit, FaCloudDownloadAlt, FaFilePdf, FaFileExcel
} from 'react-icons/fa';
import ClientOnly from '@/components/common/client-only';
import { formatRupiah } from '@/lib/formatter';
import SimpleHeader from '@/components/shared/simple-header';
import { Pagination } from '@/components/ui/pagination-numbered';
import POSSidebar from '@/modules/pos/components/POSSidebar';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

// Import hooks integrasi
import useTransactionIntegration, { Transaction, TransactionFilter } from '@/hooks/integration/use-transaction-integration';

// Definisi periode waktu untuk filter
type PeriodOption = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

// Helper untuk mendapatkan rentang tanggal berdasarkan periode
const getDateRangeByPeriod = (period: PeriodOption): { startDate?: string, endDate?: string } => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  switch (period) {
    case 'today':
      return {
        startDate: format(new Date(today.setHours(0, 0, 0, 0)), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd')
      };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return {
        startDate: format(new Date(yesterday.setHours(0, 0, 0, 0)), 'yyyy-MM-dd'),
        endDate: format(yesterday, 'yyyy-MM-dd')
      };
    case 'week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      };
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd')
      };
    case 'all':
    default:
      return {};
  }
};

const TransaksiPage = () => {
  const { t } = useTranslation();
  // State Management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState<{ startDate?: string, endDate?: string }>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Custom Hooks
  const { toast } = useToast();
  const { 
    getTransactions, 
    getTransactionById, 
    printReceipt,
    formatRupiah,
    isLoading,
    error 
  } = useTransactionIntegration();

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fungsi untuk memuat data transaksi
  const loadTransactions = async () => {
    // Dapatkan rentang tanggal berdasarkan periode
    const dateRange = getDateRangeByPeriod(period);
    
    // Siapkan filter transaksi
    const filter: TransactionFilter = {
      ...dateRange,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
      search: searchTerm || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortField,
      sortDirection: sortDirection
    };
    
    try {
      // Ambil data transaksi dari API
      const result = await getTransactions(filter);
      setTransactions(result.transactions);
      setTotalTransactions(result.total);
    } catch (err) {
      console.error('Error loading transactions:', err);
      toast({
        title: 'Error',
        description: 'Gagal memuat data transaksi. Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  // Muat data transaksi ketika filter berubah
  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, period, statusFilter, paymentFilter, sortField, sortDirection]);

  // Efek untuk menangani pencarian dengan debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Total pages
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  // Handle sort click
  const handleSortClick = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Fungsi untuk melihat detail transaksi
  const handleViewTransaction = async (id: string) => {
    try {
      const transaction = await getTransactionById(id);
      if (transaction) {
        setSelectedTransaction(transaction);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error(`Error viewing transaction ${id}:`, err);
      toast({
        title: 'Error',
        description: 'Gagal memuat detail transaksi.',
        variant: 'destructive'
      });
    }
  };

  // Fungsi untuk mencetak struk
  const handlePrintReceipt = async (transaction: Transaction) => {
    try {
      const success = await printReceipt(transaction);
      if (success) {
        toast({
          title: 'Sukses',
          description: 'Struk transaksi berhasil dicetak.',
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('Error printing receipt:', err);
      toast({
        title: 'Error',
        description: 'Gagal mencetak struk transaksi.',
        variant: 'destructive'
      });
    }
  };

  // Payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <FaMoneyBillWave className="text-green-500" />;
      case 'card': return <FaCreditCard className="text-blue-500" />;
      case 'qris': return <FaQrcode className="text-purple-500" />;
      case 'ewallet': return <FaWallet className="text-orange-500" />;
      default: return <FaMoneyBillWave className="text-gray-500" />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600"><FaCheckCircle className="mr-1" /> Selesai</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><FaClock className="mr-1" /> Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600"><FaTimesCircle className="mr-1" /> Dibatalkan</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <POSSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={toggleSidebar} 
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  <FaBars size={16} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Transaksi POS</h1>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={[
              { title: 'POS', href: '/pos' },
              { title: 'Transaksi', href: '/pos/transaksi' }
            ]} />
            
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>Daftar Transaksi</CardTitle>
                <CardDescription>
                  Kelola dan lihat semua transaksi POS kasir
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Filters */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <Input
                      placeholder="Cari transaksi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                    <FaSearch className="absolute left-3 top-[50%] transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  <Select
                    defaultValue="all"
                    value={period}
                    onValueChange={(value) => setPeriod(value as PeriodOption)}
                  >
                    <SelectTrigger className="w-full">
                      <FaCalendarAlt className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Waktu</SelectItem>
                      <SelectItem value="today">Hari Ini</SelectItem>
                      <SelectItem value="yesterday">Kemarin</SelectItem>
                      <SelectItem value="week">Minggu Ini</SelectItem>
                      <SelectItem value="month">Bulan Ini</SelectItem>
                      <SelectItem value="custom">Kustom</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {period === 'custom' && (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md pl-10 text-sm"
                          value={customDateRange.startDate || ''}
                          onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                        />
                        <FaCalendarAlt className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                      <span className="text-gray-500">-</span>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md pl-10 text-sm"
                          value={customDateRange.endDate || ''}
                          onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                        />
                        <FaCalendarAlt className="absolute left-3 top-2.5 text-gray-400" />
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white"
                        onClick={loadTransactions}
                      >
                        Terapkan
                      </Button>
                    </div>
                  )}
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua status</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua metode</SelectItem>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="card">Kartu</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {isLoading ? 'Memuat data...' : `Menampilkan ${transactions.length} dari ${totalTransactions} transaksi`}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FaPrint className="h-4 w-4" />
                      <span className="hidden sm:inline">Cetak</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FaFilePdf className="h-4 w-4 text-red-500" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FaFileExcel className="h-4 w-4 text-green-600" />
                        <span className="hidden sm:inline">Excel</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Transactions Table */}
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSortClick('id')}>
                          <div className="flex items-center">
                            Kode
                            {sortField === 'id' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSortClick('date')}>
                          <div className="flex items-center">
                            Tanggal/Waktu
                            {sortField === 'date' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSortClick('customer')}>
                          <div className="flex items-center">
                            Pelanggan
                            {sortField === 'customer' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSortClick('items')}>
                          <div className="flex items-center">
                            Item
                            {sortField === 'items' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" 
                            onClick={() => handleSortClick('total')}>
                          <div className="flex items-center">
                            Total
                            {sortField === 'total' && (
                              sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center">
                            Pembayaran
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center">
                            Status
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center">
                            Aksi
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                            <div className="flex justify-center items-center space-x-2">
                              <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Memuat data transaksi...</span>
                            </div>
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                            <div className="flex flex-col justify-center items-center space-y-2">
                              <FaReceipt className="h-8 w-8 text-gray-300" />
                              <span>Tidak ada data transaksi yang ditemukan</span>
                              <Button variant="outline" size="sm" onClick={loadTransactions} className="mt-2">
                                Muat ulang data
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction, index) => (
                          <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {transaction.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div>{transaction.date}</div>
                              <div className="text-xs">{transaction.time}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaUser className="mr-2 text-gray-400" />
                                {transaction.customerName}
                              </div>
                              <div className="text-xs text-gray-400">
                                Kasir: {transaction.cashierName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaShoppingCart className="mr-2 text-gray-400" />
                                {transaction.totalItems} item
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatRupiah(transaction.total)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(transaction.paymentMethod)}
                                <span className="ml-2">
                                  {transaction.paymentMethod === 'cash' ? 'Tunai' : 
                                   transaction.paymentMethod === 'card' ? 'Kartu' : 
                                   transaction.paymentMethod === 'qris' ? 'QRIS' : 'E-Wallet'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {getStatusBadge(transaction.status)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="h-8 px-2 text-blue-600 hover:text-blue-800" 
                                        onClick={() => handleViewTransaction(transaction.id)}>
                                  <FaEye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700"
                                        onClick={() => handlePrintReceipt(transaction)}>
                                  <FaPrint className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>

                {/* Modal Detail Transaksi */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                  <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FaReceipt className="text-red-500" />
                        Detail Transaksi {selectedTransaction?.id}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedTransaction && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border border-gray-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-500">Informasi Transaksi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Tanggal:</span>
                                <span className="font-medium">{selectedTransaction.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Waktu:</span>
                                <span className="font-medium">{selectedTransaction.time}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span>{getStatusBadge(selectedTransaction.status)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Metode Pembayaran:</span>
                                <div className="flex items-center">
                                  {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                                  <span className="ml-2">
                                    {selectedTransaction.paymentMethod === 'cash' ? 'Tunai' : 
                                     selectedTransaction.paymentMethod === 'card' ? 'Kartu' : 
                                     selectedTransaction.paymentMethod === 'qris' ? 'QRIS' : 'E-Wallet'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="border border-gray-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-500">Informasi Pelanggan & Kasir</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Pelanggan:</span>
                                <span className="font-medium">{selectedTransaction.customerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Telepon:</span>
                                <span className="font-medium">{selectedTransaction.customerName || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Kasir:</span>
                                <span className="font-medium">{selectedTransaction.cashierName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Shift:</span>
                                <span className="font-medium">{selectedTransaction.shiftId || '-'}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card className="border border-gray-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Item Transaksi</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {selectedTransaction.items?.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                                        <div className="font-medium text-gray-900">{item.productName}</div>
                                        <div className="text-gray-500 text-xs">{item.productCode || '-'}</div>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {formatRupiah(item.unitPrice)}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity} pcs
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {item.discount ? `${Math.round((item.discount / item.unitPrice) * 100)}%` : '-'}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatRupiah(item.subtotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border border-gray-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Ringkasan Pembayaran</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal:</span>
                                <span className="font-medium">{formatRupiah(selectedTransaction.subtotal || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Diskon:</span>
                                <span className="font-medium">{formatRupiah(selectedTransaction.discount || 0)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pajak:</span>
                                <span className="font-medium">{formatRupiah(selectedTransaction.tax || 0)}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Total:</span>
                                <span className="text-red-600">{formatRupiah(selectedTransaction.total)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Dibayar:</span>
                                <span className="font-medium">{formatRupiah(selectedTransaction.total)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Kembalian:</span>
                                <span className="font-medium">-</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    <DialogFooter className="flex space-x-2 justify-end">
                      <Button variant="outline" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => selectedTransaction && handlePrintReceipt(selectedTransaction)}>
                        <FaPrint className="mr-2 h-4 w-4" />
                        Cetak Struk
                      </Button>
                      <Button className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white"
                              onClick={() => setIsDetailOpen(false)}>
                        Tutup
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Alert Dialog Konfirmasi Hapus */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus transaksi {selectedTransaction?.id}? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransaksiPage;
