import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import {
  RefreshCw, Search, Building2, Warehouse,
  Clock, CheckCircle, XCircle, Eye, Check, X, Truck, Package, Plus,
  Send, FileText, Loader2, Save, Trash2
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
  status: string;
  priority: string;
  requestDate: string;
  approvedDate?: string;
  shippedDate?: string;
  receivedDate?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
}

export default function TransferManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [newTransfer, setNewTransfer] = useState({
    fromWarehouseId: '', toWarehouseId: '', notes: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }] as { productId: string; quantity: number; unitCost: number }[]
  });

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/hq/inventory/transfers?${params}`);
      const json = await res.json();
      if (json.success) {
        setTransfers(json.data?.transfers || []);
        setStats(json.data?.stats || {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [statusFilter]);

  const fetchMeta = useCallback(async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        fetch('/api/hq/warehouse?action=warehouses'),
        fetch('/api/hq/warehouse?action=products'),
      ]);
      const [whJson, prodJson] = await Promise.all([whRes.json(), prodRes.json()]);
      if (whJson.success) setWarehouses(whJson.data || []);
      if (prodJson.success) setProducts(prodJson.data?.products || prodJson.data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { setMounted(true); fetchTransfers(); fetchMeta(); }, [fetchTransfers, fetchMeta]);

  if (!mounted) return null;

  const doAction = async (id: string, operation: string, body?: any) => {
    try {
      await fetch(`/api/hq/inventory/transfers?id=${id}&operation=${operation}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {})
      });
      fetchTransfers();
      setShowDetailModal(false);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const validItems = newTransfer.items.filter(i => i.productId);
      if (!newTransfer.fromWarehouseId || !newTransfer.toWarehouseId || validItems.length === 0) {
        alert('Pilih gudang asal, tujuan, dan minimal 1 item');
        setSaving(false);
        return;
      }
      const res = await fetch('/api/hq/inventory/transfers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId: parseInt(newTransfer.fromWarehouseId),
          toWarehouseId: parseInt(newTransfer.toWarehouseId),
          notes: newTransfer.notes,
          items: validItems.map(i => ({ productId: parseInt(i.productId), quantity: i.quantity, unitCost: i.unitCost }))
        })
      });
      if (res.ok) { setShowCreateModal(false); fetchTransfers(); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const getStatusBadge = (status: string) => {
    const cfg: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
      draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700', Icon: FileText },
      pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700', Icon: Clock },
      approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700', Icon: CheckCircle },
      in_transit: { label: 'In Transit', cls: 'bg-purple-100 text-purple-700', Icon: Truck },
      shipped: { label: 'Shipped', cls: 'bg-purple-100 text-purple-700', Icon: Truck },
      received: { label: 'Received', cls: 'bg-green-100 text-green-700', Icon: CheckCircle },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700', Icon: XCircle },
      rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', Icon: XCircle },
    };
    const c = cfg[status] || cfg.draft;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.cls}`}><c.Icon className="w-3 h-3" />{c.label}</span>;
  };

  const filtered = transfers.filter(t => {
    const matchSearch = !searchTerm ||
      (t.transferNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.fromBranch?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.toBranch?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const statPending = (stats.pending || 0);
  const statApproved = (stats.approved || 0);
  const statTransit = (stats.in_transit || 0) + (stats.shipped || 0);
  const statReceived = (stats.received || 0);

  return (
    <HQLayout title="Transfer & Requisition" subtitle="Kelola transfer stok dan permintaan antar gudang/cabang">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Approval', value: statPending, icon: Clock, bg: 'yellow' },
            { label: 'Approved', value: statApproved, icon: CheckCircle, bg: 'blue' },
            { label: 'In Transit', value: statTransit, icon: Truck, bg: 'purple' },
            { label: 'Completed', value: statReceived, icon: Package, bg: 'green' },
          ].map((s, i) => (
            <div key={i} className={`bg-${s.bg}-50 border border-${s.bg}-200 rounded-xl p-4`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${s.bg}-100 rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 text-${s.bg}-600`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-${s.bg}-700`}>{s.value}</p>
                  <p className={`text-sm text-${s.bg}-600`}>{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Cari nomor transfer atau gudang..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_transit">In Transit</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchTransfers} disabled={loading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={() => {
                setNewTransfer({ fromWarehouseId: '', toWarehouseId: '', notes: '', items: [{ productId: '', quantity: 1, unitCost: 0 }] });
                setShowCreateModal(true);
              }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Plus className="w-4 h-4" /> Buat Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Tidak ada transfer ditemukan</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Transfer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dari</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ke</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-blue-600 font-mono">{t.transferNumber}</p>
                      <p className="text-xs text-gray-500">By {t.requestedBy}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t.fromBranch?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{t.fromBranch?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t.toBranch?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{t.toBranch?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-medium text-sm">{t.totalItems} items</p>
                      <p className="text-xs text-gray-500">{t.totalQuantity} unit</p>
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(t.requestDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setSelectedTransfer(t); setShowDetailModal(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><Eye className="w-4 h-4" /></button>
                        {t.status === 'pending' && (
                          <>
                            <button onClick={() => doAction(t.id, 'approve')}
                              className="p-1.5 hover:bg-green-100 rounded-lg text-green-600" title="Approve"><Check className="w-4 h-4" /></button>
                            <button onClick={() => doAction(t.id, 'cancel', { reason: 'Rejected' })}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="Reject"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {t.status === 'approved' && (
                          <button onClick={() => doAction(t.id, 'ship')}
                            className="p-1.5 hover:bg-purple-100 rounded-lg text-purple-600" title="Ship"><Send className="w-4 h-4" /></button>
                        )}
                        {(t.status === 'in_transit' || t.status === 'shipped') && (
                          <button onClick={() => doAction(t.id, 'receive')}
                            className="p-1.5 hover:bg-green-100 rounded-lg text-green-600" title="Receive"><Package className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">Buat Transfer / Requisition Baru</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Gudang/Cabang *</label>
                    <select value={newTransfer.fromWarehouseId}
                      onChange={(e) => setNewTransfer(p => ({ ...p, fromWarehouseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="">Pilih asal</option>
                      {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ke Gudang/Cabang *</label>
                    <select value={newTransfer.toWarehouseId}
                      onChange={(e) => setNewTransfer(p => ({ ...p, toWarehouseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="">Pilih tujuan</option>
                      {warehouses.filter(w => String(w.id) !== newTransfer.fromWarehouseId).map((w: any) =>
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Items *</label>
                    <button type="button" onClick={() => setNewTransfer(p => ({ ...p, items: [...p.items, { productId: '', quantity: 1, unitCost: 0 }] }))}
                      className="text-xs text-blue-600 hover:text-blue-700">+ Tambah Item</button>
                  </div>
                  <div className="space-y-2">
                    {newTransfer.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select value={item.productId} onChange={(e) => {
                          const items = [...newTransfer.items];
                          items[idx].productId = e.target.value;
                          setNewTransfer(p => ({ ...p, items }));
                        }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm">
                          <option value="">Pilih Produk</option>
                          {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                        <input type="number" value={item.quantity} min={1}
                          onChange={(e) => { const items = [...newTransfer.items]; items[idx].quantity = parseInt(e.target.value) || 1; setNewTransfer(p => ({ ...p, items })); }}
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" placeholder="Qty" />
                        {newTransfer.items.length > 1 && (
                          <button onClick={() => setNewTransfer(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan / Alasan</label>
                  <textarea value={newTransfer.notes}
                    onChange={(e) => setNewTransfer(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2}
                    placeholder="Alasan transfer, catatan khusus..." />
                </div>
              </div>
              <div className="p-5 border-t flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Membuat...' : 'Buat Transfer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTransfer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedTransfer.transferNumber}</h2>
                  <p className="text-sm text-gray-500">By {selectedTransfer.requestedBy}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-3">{getStatusBadge(selectedTransfer.status)}</div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Dari</p>
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-gray-500" />
                      <p className="font-medium">{selectedTransfer.fromBranch?.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedTransfer.fromBranch?.code}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Ke</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <p className="font-medium">{selectedTransfer.toBranch?.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedTransfer.toBranch?.code}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Items ({selectedTransfer.totalItems})</h4>
                  <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {(selectedTransfer.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </div>
                        <p className="font-medium text-sm">{item.quantity} {item.unit}</p>
                      </div>
                    ))}
                    {(!selectedTransfer.items || selectedTransfer.items.length === 0) && (
                      <p className="p-3 text-sm text-gray-500">No items loaded</p>
                    )}
                  </div>
                </div>

                {selectedTransfer.notes && (
                  <div>
                    <h4 className="font-semibold mb-1">Catatan</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-3 text-sm">{selectedTransfer.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Request</p><p className="font-medium">{formatDate(selectedTransfer.requestDate)}</p></div>
                  {selectedTransfer.approvedDate && <div><p className="text-gray-500">Approved</p><p className="font-medium">{formatDate(selectedTransfer.approvedDate)}</p></div>}
                  {selectedTransfer.shippedDate && <div><p className="text-gray-500">Shipped</p><p className="font-medium">{formatDate(selectedTransfer.shippedDate)}</p></div>}
                  {selectedTransfer.receivedDate && <div><p className="text-gray-500">Received</p><p className="font-medium">{formatDate(selectedTransfer.receivedDate)}</p></div>}
                </div>
              </div>
              <div className="p-5 border-t flex justify-end gap-3">
                <button onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Tutup</button>
                {selectedTransfer.status === 'pending' && (
                  <>
                    <button onClick={() => doAction(selectedTransfer.id, 'cancel', { reason: 'Rejected' })}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reject</button>
                    <button onClick={() => doAction(selectedTransfer.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Approve</button>
                  </>
                )}
                {selectedTransfer.status === 'approved' && (
                  <button onClick={() => doAction(selectedTransfer.id, 'ship')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Mark Shipped</button>
                )}
                {(selectedTransfer.status === 'in_transit' || selectedTransfer.status === 'shipped') && (
                  <button onClick={() => doAction(selectedTransfer.id, 'receive')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Mark Received</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
