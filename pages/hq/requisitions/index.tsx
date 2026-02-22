import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge, PriorityBadge } from '../../../components/hq/ui';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Eye,
  Edit,
  MoreVertical,
  Building2,
  Calendar,
  ArrowRight,
  FileText,
  ChevronDown,
  Send,
  Check,
  X,
  DollarSign,
  ClipboardList,
  MapPin,
  User,
  MessageSquare
} from 'lucide-react';

interface RequisitionItem {
  id: string;
  productId: number;
  productName: string;
  sku: string;
  requestedQuantity: number;
  approvedQuantity: number | null;
  fulfilledQuantity: number;
  unit: string;
  currentStock: number;
  minStock: number;
  estimatedUnitCost: number;
  status: 'pending' | 'approved' | 'partially_approved' | 'rejected' | 'fulfilled';
}

interface Requisition {
  id: string;
  irNumber: string;
  requestingBranch: {
    id: string;
    code: string;
    name: string;
    city: string;
  };
  fulfillingBranch: {
    id: string;
    code: string;
    name: string;
  } | null;
  requestType: 'restock' | 'new_item' | 'emergency' | 'scheduled' | 'transfer';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  requestedDeliveryDate: string | null;
  totalItems: number;
  totalQuantity: number;
  estimatedValue: number;
  requester: string;
  createdAt: string;
  items: RequisitionItem[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  partially_approved: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  processing: 'bg-purple-100 text-purple-800',
  ready_to_ship: 'bg-cyan-100 text-cyan-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-teal-100 text-teal-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-100 text-gray-500'
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Diajukan',
  under_review: 'Dalam Review',
  approved: 'Disetujui',
  partially_approved: 'Disetujui Sebagian',
  rejected: 'Ditolak',
  processing: 'Diproses',
  ready_to_ship: 'Siap Kirim',
  in_transit: 'Dalam Pengiriman',
  delivered: 'Terkirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export default function InternalRequisitions() {
  const [mounted, setMounted] = useState(false);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const mockRequisitions: Requisition[] = [
    {
      id: '1',
      irNumber: 'IR-BR002-2602-0001',
      requestingBranch: { id: '2', code: 'BR-002', name: 'Cabang Bandung', city: 'Bandung' },
      fulfillingBranch: { id: '6', code: 'WH-001', name: 'Gudang Pusat Cikarang' },
      requestType: 'restock',
      priority: 'high',
      status: 'submitted',
      requestedDeliveryDate: '2026-02-25',
      totalItems: 15,
      totalQuantity: 450,
      estimatedValue: 12500000,
      requester: 'Siti Rahayu',
      createdAt: '2026-02-22T03:30:00Z',
      items: [
        { id: '1-1', productId: 1, productName: 'Beras Premium 5kg', sku: 'BRS-001', requestedQuantity: 50, approvedQuantity: null, fulfilledQuantity: 0, unit: 'karung', currentStock: 10, minStock: 30, estimatedUnitCost: 75000, status: 'pending' },
        { id: '1-2', productId: 2, productName: 'Minyak Goreng 2L', sku: 'MYK-001', requestedQuantity: 100, approvedQuantity: null, fulfilledQuantity: 0, unit: 'botol', currentStock: 25, minStock: 50, estimatedUnitCost: 35000, status: 'pending' }
      ]
    },
    {
      id: '2',
      irNumber: 'IR-BR003-2602-0002',
      requestingBranch: { id: '3', code: 'BR-003', name: 'Cabang Surabaya', city: 'Surabaya' },
      fulfillingBranch: { id: '6', code: 'WH-001', name: 'Gudang Pusat Cikarang' },
      requestType: 'emergency',
      priority: 'urgent',
      status: 'under_review',
      requestedDeliveryDate: '2026-02-23',
      totalItems: 5,
      totalQuantity: 200,
      estimatedValue: 8500000,
      requester: 'Budi Santoso',
      createdAt: '2026-02-22T01:15:00Z',
      items: []
    },
    {
      id: '3',
      irNumber: 'IR-BR004-2602-0003',
      requestingBranch: { id: '4', code: 'BR-004', name: 'Cabang Medan', city: 'Medan' },
      fulfillingBranch: { id: '6', code: 'WH-001', name: 'Gudang Pusat Cikarang' },
      requestType: 'scheduled',
      priority: 'normal',
      status: 'approved',
      requestedDeliveryDate: '2026-02-28',
      totalItems: 25,
      totalQuantity: 800,
      estimatedValue: 22000000,
      requester: 'Dewi Lestari',
      createdAt: '2026-02-21T08:00:00Z',
      items: []
    },
    {
      id: '4',
      irNumber: 'IR-BR005-2602-0004',
      requestingBranch: { id: '5', code: 'BR-005', name: 'Cabang Yogyakarta', city: 'Yogyakarta' },
      fulfillingBranch: null,
      requestType: 'restock',
      priority: 'low',
      status: 'draft',
      requestedDeliveryDate: null,
      totalItems: 8,
      totalQuantity: 150,
      estimatedValue: 4500000,
      requester: 'Eko Prasetyo',
      createdAt: '2026-02-22T05:00:00Z',
      items: []
    },
    {
      id: '5',
      irNumber: 'IR-BR002-2602-0005',
      requestingBranch: { id: '2', code: 'BR-002', name: 'Cabang Bandung', city: 'Bandung' },
      fulfillingBranch: { id: '6', code: 'WH-001', name: 'Gudang Pusat Cikarang' },
      requestType: 'restock',
      priority: 'normal',
      status: 'in_transit',
      requestedDeliveryDate: '2026-02-22',
      totalItems: 12,
      totalQuantity: 300,
      estimatedValue: 9800000,
      requester: 'Siti Rahayu',
      createdAt: '2026-02-20T10:30:00Z',
      items: []
    }
  ];

  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('includeStats', 'true');
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      // Use unified API for integrated data with branch RAC
      const response = await fetch(`/api/requisitions/unified?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Map unified data to HQ requisition format
        const mappedReqs = (data.data || []).map((req: any) => ({
          id: req.id,
          irNumber: req.irNumber || req.requestNumber,
          requestingBranch: req.requestingBranch,
          fulfillingBranch: req.fulfillingBranch,
          requestType: req.requestType,
          priority: req.priority,
          status: req.status,
          requestedDeliveryDate: req.requestedDeliveryDate || req.requiredDate,
          totalItems: req.totalItems,
          totalQuantity: req.totalQuantity,
          estimatedValue: req.estimatedValue,
          requester: req.requestedBy,
          createdAt: req.createdAt,
          items: req.items || []
        }));
        setRequisitions(mappedReqs.length > 0 ? mappedReqs : mockRequisitions);
      } else {
        setRequisitions(mockRequisitions);
      }
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      setRequisitions(mockRequisitions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRequisitions();
  }, [statusFilter, priorityFilter]);

  if (!mounted) {
    return null;
  }

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.irNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestingBranch.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async (requisitionId: string) => {
    try {
      // Use unified API for approval - syncs with branch RAC automatically
      const response = await fetch(`/api/requisitions/unified?id=${requisitionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      
      if (response.ok) {
        alert('Requisition disetujui & disinkronkan ke cabang!');
        fetchRequisitions();
      }
    } catch (error) {
      console.error('Error approving requisition:', error);
    }
  };

  const handleReject = async (requisitionId: string) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason) return;
    
    try {
      // Use unified API for rejection - syncs with branch RAC automatically
      const response = await fetch(`/api/requisitions/unified?id=${requisitionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason })
      });
      
      if (response.ok) {
        alert('Requisition ditolak & disinkronkan ke cabang!');
        fetchRequisitions();
      }
    } catch (error) {
      console.error('Error rejecting requisition:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'under_review':
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Summary stats
  const stats = {
    pending: requisitions.filter(r => ['submitted', 'under_review'].includes(r.status)).length,
    approved: requisitions.filter(r => r.status === 'approved').length,
    inProgress: requisitions.filter(r => ['processing', 'ready_to_ship', 'in_transit'].includes(r.status)).length,
    urgent: requisitions.filter(r => r.priority === 'urgent').length
  };

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Internal Requisition</h1>
              <p className="text-sm text-gray-500">Kelola permintaan barang dari cabang ke Pusat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequisitions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Konsolidasi PO
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Menunggu Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disetujui</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor IR atau cabang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Diajukan</option>
              <option value="under_review">Dalam Review</option>
              <option value="approved">Disetujui</option>
              <option value="processing">Diproses</option>
              <option value="in_transit">Dalam Pengiriman</option>
              <option value="completed">Selesai</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. IR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cabang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Prioritas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Nilai</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-gray-400" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    Tidak ada permintaan ditemukan
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.irNumber}</div>
                      <div className="text-xs text-gray-500">{req.requester}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{req.requestingBranch.name}</div>
                          <div className="text-xs text-gray-500">{req.requestingBranch.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-700">{req.requestType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[req.priority]}`}>
                        {req.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {getStatusIcon(req.status)}
                        {statusLabels[req.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900">{req.totalItems}</div>
                      <div className="text-xs text-gray-500">{req.totalQuantity} unit</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(req.estimatedValue)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{new Date(req.createdAt).toLocaleDateString('id-ID')}</div>
                      {req.requestedDeliveryDate && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(req.requestedDeliveryDate).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequisition(req);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {['submitted', 'under_review'].includes(req.status) && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Setujui"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tolak"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Consolidation Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Konsolidasi Purchase Order</h3>
              <p className="text-blue-100 text-sm max-w-2xl">
                Gabungkan beberapa Internal Requisition yang disetujui menjadi satu Purchase Order 
                untuk mendapatkan harga borong (economy of scale) dari supplier.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              <Send className="w-4 h-4" />
              Buat PO Konsolidasi
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-blue-100">IR siap dikonsolidasi</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {formatCurrency(requisitions.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.estimatedValue, 0))}
              </div>
              <div className="text-sm text-blue-100">Total estimasi nilai</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {requisitions.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalItems, 0)}
              </div>
              <div className="text-sm text-blue-100">Total item produk</div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRequisition?.irNumber}</h2>
                  <p className="text-sm text-gray-500">Detail Internal Requisition</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Cabang Peminta</h4>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{selectedRequisition?.requestingBranch?.name}</div>
                      <div className="text-sm text-gray-500">{selectedRequisition?.requestingBranch?.city}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Dipenuhi Oleh</h4>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {selectedRequisition?.fulfillingBranch?.name || 'Belum ditentukan'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[selectedRequisition?.status] || ''}`}>
                    {statusLabels[selectedRequisition?.status] || '-'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Prioritas</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${priorityColors[selectedRequisition?.priority] || ''}`}>
                    {selectedRequisition?.priority?.toUpperCase() || '-'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Total Item</div>
                  <div className="font-bold text-lg">{selectedRequisition?.totalItems || 0}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Estimasi Nilai</div>
                  <div className="font-bold text-lg">{formatCurrency(selectedRequisition?.estimatedValue || 0)}</div>
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-3">Daftar Item</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produk</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Stok Saat Ini</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Min Stok</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Diminta</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Disetujui</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Est. Biaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedRequisition?.items?.length > 0 ? (
                      selectedRequisition?.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.sku}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={item.currentStock < item.minStock ? 'text-red-600 font-medium' : ''}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{item.minStock}</td>
                          <td className="px-4 py-3 text-right font-medium">{item.requestedQuantity} {item.unit}</td>
                          <td className="px-4 py-3 text-right">
                            {item.approvedQuantity !== null ? (
                              <span className="text-green-600 font-medium">{item.approvedQuantity}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.requestedQuantity * item.estimatedUnitCost)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Data item belum tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Tutup
                </button>
                {['submitted', 'under_review'].includes(selectedRequisition?.status) && (
                  <>
                    <button
                      onClick={() => handleReject(selectedRequisition?.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequisition?.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Setujui
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </HQLayout>
  );
}
