import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { 
  FaReceipt, FaSearch, FaDownload, FaPrint, 
  FaEye, FaEnvelope, FaFileInvoice, FaSpinner
} from 'react-icons/fa';

const ReceiptsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const MOCK_RECEIPTS = [
    { id: 'rc1', receiptNumber: 'RCP-20260315-001', transactionNumber: 'TRX-20260315-001', date: '2026-03-15T09:15:00', totalAmount: 185000, paymentMethod: 'cash', customerName: '-', cashier: 'Budi S.', itemCount: 3 },
    { id: 'rc2', receiptNumber: 'RCP-20260315-002', transactionNumber: 'TRX-20260315-002', date: '2026-03-15T09:45:00', totalAmount: 250000, paymentMethod: 'qris', customerName: 'Siti R.', cashier: 'Budi S.', itemCount: 5 },
    { id: 'rc3', receiptNumber: 'RCP-20260315-003', transactionNumber: 'TRX-20260315-003', date: '2026-03-15T10:20:00', totalAmount: 95000, paymentMethod: 'cash', customerName: '-', cashier: 'Siti R.', itemCount: 2 },
  ];
  const MOCK_RCP_STATS = { totalReceipts: 85, totalAmount: 18500000, printedCount: 72, emailedCount: 13 };
  const [receipts, setReceipts] = useState<any[]>(MOCK_RECEIPTS);
  const [stats, setStats] = useState<any>(MOCK_RCP_STATS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchReceipts();
    }
  }, [session, page, searchTerm]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm
      });

      const response = await fetch(`/api/pos/receipts/list?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReceipts(data.data.receipts || []);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('Failed to fetch receipts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts(MOCK_RECEIPTS);
      setStats(MOCK_RCP_STATS);
    } finally {
      setLoading(false);
    }
  };

  const viewReceiptDetail = async (receiptId: string) => {
    try {
      const response = await fetch(`/api/pos/receipts/${receiptId}/detail`);
      const data = await response.json();

      if (data.success) {
        setSelectedReceipt(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching receipt detail:', error);
    }
  };

  const handlePrint = (receiptId: string) => {
    window.open(`/api/pos/receipts/${receiptId}/print`, '_blank');
  };

  const handleDownload = async (receiptId: string) => {
    alert('Download PDF feature coming soon!');
  };

  const handleEmail = async (receiptId: string) => {
    alert('Email feature coming soon!');
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Struk & Invoice...</p>
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
        <title>Struk & Invoice | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Struk & Invoice</h1>
              <p className="text-purple-100">
                Kelola struk dan invoice penjualan
              </p>
            </div>
            <FaReceipt className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Struk</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.todayReceipts || 0}</p>
            <span className="text-sm text-green-600 font-medium">Hari ini</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Invoice</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.todayInvoices || 0}</p>
            <span className="text-sm text-green-600 font-medium">Hari ini</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Dokumen</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalReceipts || 0}</p>
            <span className="text-sm text-gray-600">Semua</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Invoice</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalInvoices || 0}</p>
            <span className="text-sm text-gray-600">Semua</span>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor struk, invoice, pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push('/pos/cashier')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaFileInvoice />
                <span>Buat Invoice Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Struk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
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
                      <FaSpinner className="animate-spin h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-gray-500">Memuat data...</p>
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <FaReceipt className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Tidak ada struk/invoice</p>
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-purple-600">{receipt.receiptNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{receipt.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{new Date(receipt.date).toLocaleDateString('id-ID')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{receipt.customer.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(receipt.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receipt.type === 'Struk' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {receipt.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receipt.status === 'Tercetak' 
                            ? 'bg-green-100 text-green-800' 
                            : receipt.status === 'Terkirim'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {receipt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => viewReceiptDetail(receipt.id)}
                            className="text-blue-600 hover:text-blue-800" 
                            title="Lihat"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handlePrint(receipt.id)}
                            className="text-gray-600 hover:text-gray-800" 
                            title="Cetak"
                          >
                            <FaPrint />
                          </button>
                          <button 
                            onClick={() => handleDownload(receipt.id)}
                            className="text-green-600 hover:text-green-800" 
                            title="Download"
                          >
                            <FaDownload />
                          </button>
                          <button 
                            onClick={() => handleEmail(receipt.id)}
                            className="text-purple-600 hover:text-purple-800" 
                            title="Kirim Email"
                          >
                            <FaEnvelope />
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
      </div>
    </DashboardLayout>
  );
};

export default ReceiptsPage;
