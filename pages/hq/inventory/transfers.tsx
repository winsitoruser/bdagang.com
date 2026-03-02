import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HQLayout from '../../../components/hq/HQLayout';
import { toast } from 'react-hot-toast';
import {
  ArrowRightLeft,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronLeft,
  Building2,
  Warehouse,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  Truck,
  Package,
  Plus,
  AlertTriangle,
  Send,
  FileText
} from 'lucide-react';

interface TransferItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
}

interface Transfer {
  id: string;
  transferNumber: string;
  fromBranch: { id: string; name: string; code: string };
  toBranch: { id: string; name: string; code: string };
  items: TransferItem[];
  totalItems: number;
  totalQuantity: number;
  status: 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestDate: string;
  approvedDate?: string;
  shippedDate?: string;
  receivedDate?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
}

const mockTransfers: Transfer[] = [
  {
    id: '1', transferNumber: 'TRF-2026-0089',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '3', name: 'Cabang Bandung', code: 'BR-002' },
    items: [
      { productId: '1', productName: 'Beras Premium 5kg', sku: 'BRS-001', quantity: 200, unit: 'pcs' },
      { productId: '2', productName: 'Minyak Goreng 2L', sku: 'MYK-001', quantity: 150, unit: 'pcs' }
    ],
    totalItems: 2, totalQuantity: 350, status: 'pending', priority: 'high',
    requestDate: '2026-02-22T08:00:00', requestedBy: 'Manager Bandung', notes: 'Stok menipis, butuh segera'
  },
  {
    id: '2', transferNumber: 'TRF-2026-0088',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '5', name: 'Cabang Medan', code: 'BR-004' },
    items: [
      { productId: '6', productName: 'Tepung Terigu 1kg', sku: 'TPG-001', quantity: 500, unit: 'pcs' }
    ],
    totalItems: 1, totalQuantity: 500, status: 'approved', priority: 'urgent',
    requestDate: '2026-02-21T14:00:00', approvedDate: '2026-02-21T16:00:00',
    requestedBy: 'Manager Medan', approvedBy: 'Admin HQ', notes: 'Out of stock - urgent'
  },
  {
    id: '3', transferNumber: 'TRF-2026-0087',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '4', name: 'Cabang Surabaya', code: 'BR-003' },
    items: [
      { productId: '3', productName: 'Gula Pasir 1kg', sku: 'GLA-001', quantity: 300, unit: 'pcs' },
      { productId: '4', productName: 'Kopi Arabica 250g', sku: 'KPI-001', quantity: 100, unit: 'pcs' },
      { productId: '5', productName: 'Susu UHT 1L', sku: 'SSU-001', quantity: 200, unit: 'pcs' }
    ],
    totalItems: 3, totalQuantity: 600, status: 'shipped', priority: 'normal',
    requestDate: '2026-02-20T10:00:00', approvedDate: '2026-02-20T12:00:00', shippedDate: '2026-02-21T08:00:00',
    requestedBy: 'Manager Surabaya', approvedBy: 'Admin HQ'
  },
  {
    id: '4', transferNumber: 'TRF-2026-0086',
    fromBranch: { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
    toBranch: { id: '2', name: 'Cabang Jakarta', code: 'HQ-001' },
    items: [
      { productId: '1', productName: 'Beras Premium 5kg', sku: 'BRS-001', quantity: 100, unit: 'pcs' }
    ],
    totalItems: 1, totalQuantity: 100, status: 'received', priority: 'normal',
    requestDate: '2026-02-19T09:00:00', approvedDate: '2026-02-19T11:00:00', 
    shippedDate: '2026-02-19T14:00:00', receivedDate: '2026-02-20T10:00:00',
    requestedBy: 'Manager Jakarta', approvedBy: 'Admin HQ'
  },
  {
    id: '5', transferNumber: 'TRF-2026-0085',
    fromBranch: { id: '2', name: 'Cabang Jakarta', code: 'HQ-001' },
    toBranch: { id: '6', name: 'Cabang Yogyakarta', code: 'BR-005' },
    items: [
      { productId: '2', productName: 'Minyak Goreng 2L', sku: 'MYK-001', quantity: 50, unit: 'pcs' }
    ],
    totalItems: 1, totalQuantity: 50, status: 'rejected', priority: 'low',
    requestDate: '2026-02-18T11:00:00', requestedBy: 'Manager Yogyakarta', notes: 'Stok cabang asal tidak mencukupi'
  }
];

const branches = [
  { id: '1', name: 'Gudang Pusat', code: 'WH-001' },
  { id: '2', name: 'Cabang Jakarta', code: 'HQ-001' },
  { id: '3', name: 'Cabang Bandung', code: 'BR-002' },
  { id: '4', name: 'Cabang Surabaya', code: 'BR-003' },
  { id: '5', name: 'Cabang Medan', code: 'BR-004' },
  { id: '6', name: 'Cabang Yogyakarta', code: 'BR-005' }
];

export default function TransferManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [newTransfer, setNewTransfer] = useState({
    fromBranch: '',
    toBranch: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    notes: '',
    items: [{ productId: '', productName: '', sku: '', quantity: 0, unit: 'pcs' }]
  });

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

  if (!mounted) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"><FileText className="w-3 h-3" />Draft</span>;
      case 'pending': return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />Pending</span>;
      case 'approved': return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />Approved</span>;
      case 'shipped': return <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"><Truck className="w-3 h-3" />Shipped</span>;
      case 'received': return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />Received</span>;
      case 'rejected': return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle className="w-3 h-3" />Rejected</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="px-2 py-1 bg-red-500 text-white rounded text-xs">Urgent</span>;
      case 'high': return <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs">High</span>;
      case 'normal': return <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Normal</span>;
      case 'low': return <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">Low</span>;
      default: return null;
    }
  };

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.fromBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.toBranch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: transfers.filter(t => t.status === 'pending').length,
    approved: transfers.filter(t => t.status === 'approved').length,
    shipped: transfers.filter(t => t.status === 'shipped').length,
    received: transfers.filter(t => t.status === 'received').length
  };

  const handleApprove = (transfer: Transfer) => {
    setTransfers(transfers.map(t => 
      t.id === transfer.id ? { ...t, status: 'approved' as const, approvedDate: new Date().toISOString(), approvedBy: 'Admin HQ' } : t
    ));
    setShowDetailModal(false);
    toast.success(`Transfer ${transfer.transferNumber} approved`);
  };

  const handleReject = (transfer: Transfer) => {
    setTransfers(transfers.map(t => 
      t.id === transfer.id ? { ...t, status: 'rejected' as const } : t
    ));
    setShowDetailModal(false);
    toast.error(`Transfer ${transfer.transferNumber} rejected`);
  };

  const handleShip = (transfer: Transfer) => {
    setTransfers(transfers.map(t => 
      t.id === transfer.id ? { ...t, status: 'shipped' as const, shippedDate: new Date().toISOString() } : t
    ));
    setShowDetailModal(false);
    toast.success(`Transfer ${transfer.transferNumber} shipped`);
  };

  const handleReceive = (transfer: Transfer) => {
    setTransfers(transfers.map(t => 
      t.id === transfer.id ? { ...t, status: 'received' as const, receivedDate: new Date().toISOString() } : t
    ));
    setShowDetailModal(false);
    toast.success(`Transfer ${transfer.transferNumber} received`);
  };

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq/inventory" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transfer Management</h1>
              <p className="text-gray-500">Kelola transfer stok antar cabang</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const rows = filteredTransfers.map(t => `${t.transferNumber},${t.fromBranch.name},${t.toBranch.name},${t.totalItems},${t.totalQuantity},${t.status},${t.priority},${t.requestDate}`);
              const csv = `TransferNo,From,To,Items,Qty,Status,Priority,Date\n${rows.join('\n')}`;
              const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'transfers-report.csv'; a.click(); URL.revokeObjectURL(url);
              toast.success('Export transfer berhasil');
            }} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4" /> Buat Transfer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                <p className="text-sm text-yellow-600">Pending Approval</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.approved}</p>
                <p className="text-sm text-blue-600">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
                <p className="text-sm text-purple-600">In Transit</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.received}</p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor transfer atau cabang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Transfer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dari</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ke</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-blue-600">{transfer.transferNumber}</p>
                    <p className="text-xs text-gray-500">By {transfer.requestedBy}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {transfer.fromBranch.code.startsWith('WH') ? (
                        <Warehouse className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transfer.fromBranch.name}</p>
                        <p className="text-xs text-gray-500">{transfer.fromBranch.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {transfer.toBranch.code.startsWith('WH') ? (
                        <Warehouse className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transfer.toBranch.name}</p>
                        <p className="text-xs text-gray-500">{transfer.toBranch.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <p className="font-medium text-gray-900">{transfer.totalItems} items</p>
                    <p className="text-xs text-gray-500">{transfer.totalQuantity} unit</p>
                  </td>
                  <td className="px-5 py-4 text-center">{getPriorityBadge(transfer.priority)}</td>
                  <td className="px-5 py-4 text-center">{getStatusBadge(transfer.status)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{formatDate(transfer.requestDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedTransfer(transfer); setShowDetailModal(true); }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {transfer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(transfer)}
                            className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(transfer)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {transfer.status === 'approved' && (
                        <button
                          onClick={() => handleShip(transfer)}
                          className="p-2 hover:bg-purple-100 rounded-lg text-purple-600"
                          title="Ship"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Transfer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Buat Transfer Baru</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Cabang *</label>
                    <select
                      value={newTransfer.fromBranch}
                      onChange={(e) => setNewTransfer({ ...newTransfer, fromBranch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Pilih cabang asal</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ke Cabang *</label>
                    <select
                      value={newTransfer.toBranch}
                      onChange={(e) => setNewTransfer({ ...newTransfer, toBranch: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Pilih cabang tujuan</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <select
                    value={newTransfer.priority}
                    onChange={(e) => setNewTransfer({ ...newTransfer, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items *</label>
                  {newTransfer.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nama produk / SKU"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        value={item.productName}
                        onChange={(e) => {
                          const items = [...newTransfer.items];
                          items[idx].productName = e.target.value;
                          setNewTransfer({ ...newTransfer, items });
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        value={item.quantity || ''}
                        onChange={(e) => {
                          const items = [...newTransfer.items];
                          items[idx].quantity = parseInt(e.target.value) || 0;
                          setNewTransfer({ ...newTransfer, items });
                        }}
                      />
                      {newTransfer.items.length > 1 && (
                        <button
                          onClick={() => {
                            const items = newTransfer.items.filter((_, i) => i !== idx);
                            setNewTransfer({ ...newTransfer, items });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewTransfer({ ...newTransfer, items: [...newTransfer.items, { productId: '', productName: '', sku: '', quantity: 0, unit: 'pcs' }] })}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Tambah Item
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={newTransfer.notes}
                    onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Alasan transfer atau catatan tambahan..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Buat Transfer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTransfer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTransfer.transferNumber}</h2>
                  <p className="text-sm text-gray-500">Request by {selectedTransfer.requestedBy}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  {getStatusBadge(selectedTransfer.status)}
                  {getPriorityBadge(selectedTransfer.priority)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Dari</p>
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-gray-500" />
                      <p className="font-medium text-gray-900">{selectedTransfer.fromBranch.name}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Ke</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <p className="font-medium text-gray-900">{selectedTransfer.toBranch.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Items ({selectedTransfer.totalItems})</h4>
                  <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {selectedTransfer.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                        <p className="font-medium text-gray-900">{item.quantity} {item.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTransfer.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catatan</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{selectedTransfer.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Request Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedTransfer.requestDate)}</p>
                  </div>
                  {selectedTransfer.approvedDate && (
                    <div>
                      <p className="text-gray-500">Approved Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedTransfer.approvedDate)}</p>
                    </div>
                  )}
                  {selectedTransfer.shippedDate && (
                    <div>
                      <p className="text-gray-500">Shipped Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedTransfer.shippedDate)}</p>
                    </div>
                  )}
                  {selectedTransfer.receivedDate && (
                    <div>
                      <p className="text-gray-500">Received Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedTransfer.receivedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
                {selectedTransfer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReject(selectedTransfer)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTransfer)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedTransfer.status === 'approved' && (
                  <button
                    onClick={() => handleShip(selectedTransfer)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Mark as Shipped
                  </button>
                )}
                {selectedTransfer.status === 'shipped' && (
                  <button
                    onClick={() => handleReceive(selectedTransfer)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Received
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
