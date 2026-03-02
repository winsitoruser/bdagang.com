import React, { useState, useEffect, useCallback } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import {
  ShoppingCart, Save, RefreshCw, Plus, Trash2, Search, Eye,
  Package, DollarSign, FileText, CheckCircle, XCircle, Clock,
  Send, Loader2
} from 'lucide-react';

interface POItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  receivedQty: number;
  unitPrice: number;
  subtotal: number;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  supplier_code: string;
  warehouse_id: number;
  warehouse_name: string;
  status: string;
  payment_terms: string;
  expected_delivery: string | null;
  actual_delivery: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  created_by_name: string;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
  items: POItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending: { label: 'Menunggu Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  ordered: { label: 'Dikirim ke Supplier', color: 'bg-purple-100 text-purple-800', icon: Send },
  partial: { label: 'Diterima Sebagian', color: 'bg-orange-100 text-orange-800', icon: Package },
  received: { label: 'Diterima Lengkap', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: XCircle },
  sent: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800', icon: Send },
};

export default function PurchaseOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState<Record<string, number>>({});

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    supplierId: '', warehouseId: '', paymentTerms: 'Net 30',
    expectedDelivery: '', notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }] as { productId: string; quantity: number; unitPrice: number }[]
  });
  const [products, setProducts] = useState<any[]>([]);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: 'purchase-orders' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/hq/warehouse?${params}`);
      const json = await res.json();
      if (json.success) {
        setPOs(json.data?.purchaseOrders || []);
        setStats(json.data?.stats || {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [statusFilter]);

  const fetchMeta = useCallback(async () => {
    try {
      const [supRes, whRes, prodRes] = await Promise.all([
        fetch('/api/hq/warehouse?action=suppliers'),
        fetch('/api/hq/warehouse?action=warehouses'),
        fetch('/api/hq/warehouse?action=products'),
      ]);
      const [supJson, whJson, prodJson] = await Promise.all([supRes.json(), whRes.json(), prodRes.json()]);
      if (supJson.success) setSuppliers(supJson.data || []);
      if (whJson.success) setWarehouses(whJson.data || []);
      if (prodJson.success) setProducts(prodJson.data?.products || prodJson.data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { setMounted(true); fetchPOs(); fetchMeta(); }, [fetchPOs, fetchMeta]);

  if (!mounted) return null;

  const handleApprove = async (po: PurchaseOrder) => {
    try {
      await fetch(`/api/hq/warehouse?action=po-detail&id=${po.id}&operation=approve`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}'
      });
      fetchPOs();
    } catch (e) { console.error(e); }
  };

  const handleOrder = async (po: PurchaseOrder) => {
    try {
      await fetch(`/api/hq/warehouse?action=po-detail&id=${po.id}&operation=order`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}'
      });
      fetchPOs();
    } catch (e) { console.error(e); }
  };

  const handleCancel = async () => {
    if (!selectedPO) return;
    try {
      await fetch(`/api/hq/warehouse?action=po-detail&id=${selectedPO.id}&operation=cancel`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by admin' })
      });
      fetchPOs();
    } catch (e) { console.error(e); }
    setShowDeleteConfirm(false);
    setSelectedPO(null);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hq/warehouse?action=purchase-orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: parseInt(createForm.supplierId),
          warehouseId: createForm.warehouseId ? parseInt(createForm.warehouseId) : null,
          paymentTerms: createForm.paymentTerms,
          expectedDelivery: createForm.expectedDelivery || null,
          notes: createForm.notes,
          items: createForm.items.filter(i => i.productId).map(i => ({
            productId: parseInt(i.productId), quantity: i.quantity, unitPrice: i.unitPrice
          }))
        })
      });
      if (res.ok) { setShowCreateModal(false); fetchPOs(); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const filtered = pos.filter(po => {
    const matchSearch = !searchTerm ||
      (po.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalAll = pos.length;
  const totalDraft = stats.draft || 0;
  const totalPending = (stats.pending || 0) + (stats.approved || 0) + (stats.ordered || 0);
  const totalReceived = (stats.received || 0) + (stats.partial || 0);
  const totalValue = pos.reduce((s, p) => s + (parseFloat(String(p.total_amount)) || 0), 0);

  const getSC = (status: string) => statusConfig[status] || statusConfig.draft;

  return (
    <HQLayout title="Purchase Orders" subtitle="Kelola pembelian ke supplier">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total PO', value: totalAll, icon: ShoppingCart, color: 'blue' },
            { label: 'Draft', value: totalDraft, icon: FileText, color: 'gray' },
            { label: 'Dalam Proses', value: totalPending, icon: Clock, color: 'yellow' },
            { label: 'Diterima', value: totalReceived, icon: CheckCircle, color: 'green' },
            { label: 'Total Nilai', value: fmt(totalValue), icon: DollarSign, color: 'purple', isText: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${s.color}-100 rounded-lg`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className={`${(s as any).isText ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Cari PO..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Disetujui</option>
                  <option value="ordered">Dikirim</option>
                  <option value="partial">Sebagian</option>
                  <option value="received">Diterima</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchPOs} disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button onClick={() => {
                  setCreateForm({ supplierId: '', warehouseId: '', paymentTerms: 'Net 30', expectedDelivery: '', notes: '', items: [{ productId: '', quantity: 1, unitPrice: 0 }] });
                  setShowCreateModal(true);
                }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Plus className="w-4 h-4" /> Buat PO
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Tidak ada purchase order ditemukan</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">No. PO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase">Gudang</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase">Total</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">Tgl Kirim</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs uppercase">Dibuat</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((po) => {
                    const sc = getSC(po.status);
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-blue-600">{po.po_number}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{po.supplier_name || '-'}</p>
                          <p className="text-xs text-gray-500">{po.supplier_code}</p>
                        </td>
                        <td className="py-3 px-4 text-sm">{po.warehouse_name || '-'}</td>
                        <td className="py-3 px-4 text-right font-medium">{fmt(parseFloat(String(po.total_amount)))}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />{sc.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{fmtDate(po.expected_delivery || '')}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{fmtDate(po.created_at)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelectedPO(po); setShowViewModal(true); }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                            {(po.status === 'draft' || po.status === 'pending') && (
                              <button onClick={() => handleApprove(po)}
                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                                <CheckCircle className="w-4 h-4" /></button>
                            )}
                            {po.status === 'approved' && (
                              <button onClick={() => handleOrder(po)}
                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Order">
                                <Send className="w-4 h-4" /></button>
                            )}
                            {(po.status === 'draft' || po.status === 'pending') && (
                              <button onClick={() => { setSelectedPO(po); setShowDeleteConfirm(true); }}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <XCircle className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}
          title={`Detail PO - ${selectedPO?.po_number || ''}`} size="xl">
          {selectedPO && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Supplier</p><p className="font-medium">{selectedPO.supplier_name}</p></div>
                  <div><p className="text-sm text-gray-500">Gudang</p><p className="font-medium">{selectedPO.warehouse_name || '-'}</p></div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getSC(selectedPO.status).color}`}>
                      {getSC(selectedPO.status).label}
                    </span>
                  </div>
                  <div><p className="text-sm text-gray-500">Catatan</p><p>{selectedPO.notes || '-'}</p></div>
                </div>
                <div className="space-y-3">
                  <div><p className="text-sm text-gray-500">Total Nilai</p><p className="text-2xl font-bold">{fmt(parseFloat(String(selectedPO.total_amount)))}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-sm text-gray-500">Payment</p><p className="font-medium">{selectedPO.payment_terms || '-'}</p></div>
                    <div><p className="text-sm text-gray-500">Expected Delivery</p><p className="font-medium">{fmtDate(selectedPO.expected_delivery || '')}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-sm text-gray-500">Dibuat</p><p className="font-medium">{fmtDate(selectedPO.created_at)}</p><p className="text-xs text-gray-500">{selectedPO.created_by_name}</p></div>
                    <div><p className="text-sm text-gray-500">Disetujui</p><p className="font-medium">{fmtDate(selectedPO.approved_at || '')}</p><p className="text-xs text-gray-500">{selectedPO.approved_by_name || '-'}</p></div>
                  </div>
                </div>
              </div>
              {selectedPO.items && selectedPO.items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daftar Item</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Produk</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Qty</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Diterima</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Harga</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-3"><p className="font-medium">{item.productName}</p><p className="text-xs text-gray-500">{item.sku}</p></td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-center">{item.receivedQty || 0}</td>
                          <td className="py-2 px-3 text-right">{fmt(item.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-medium">{fmt(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Purchase Order Baru" size="xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select value={createForm.supplierId} onChange={(e) => setCreateForm(p => ({ ...p, supplierId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Pilih Supplier</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gudang Tujuan</label>
                <select value={createForm.warehouseId} onChange={(e) => setCreateForm(p => ({ ...p, warehouseId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Pilih Gudang</option>
                  {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select value={createForm.paymentTerms} onChange={(e) => setCreateForm(p => ({ ...p, paymentTerms: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="COD">COD</option><option value="Net 7">Net 7</option><option value="Net 14">Net 14</option>
                  <option value="Net 30">Net 30</option><option value="Net 45">Net 45</option><option value="Net 60">Net 60</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                <input type="date" value={createForm.expectedDelivery}
                  onChange={(e) => setCreateForm(p => ({ ...p, expectedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea value={createForm.notes} onChange={(e) => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Item PO</label>
                <button type="button" onClick={() => setCreateForm(p => ({ ...p, items: [...p.items, { productId: '', quantity: 1, unitPrice: 0 }] }))}
                  className="text-xs text-blue-600 hover:text-blue-700">+ Tambah Item</button>
              </div>
              <div className="space-y-2">
                {createForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select value={item.productId} onChange={(e) => {
                      const items = [...createForm.items];
                      items[idx].productId = e.target.value;
                      const prod = products.find((p: any) => String(p.id) === e.target.value);
                      if (prod) items[idx].unitPrice = parseFloat(prod.price || prod.sell_price || prod.cost_price || 0);
                      setCreateForm(p => ({ ...p, items }));
                    }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm">
                      <option value="">Pilih Produk</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" value={item.quantity} min={1}
                      onChange={(e) => { const items = [...createForm.items]; items[idx].quantity = parseInt(e.target.value) || 1; setCreateForm(p => ({ ...p, items })); }}
                      className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" placeholder="Qty" />
                    <input type="number" value={item.unitPrice} min={0}
                      onChange={(e) => { const items = [...createForm.items]; items[idx].unitPrice = parseFloat(e.target.value) || 0; setCreateForm(p => ({ ...p, items })); }}
                      className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm text-right" placeholder="Harga" />
                    <span className="text-sm font-medium w-28 text-right">{fmt(item.quantity * item.unitPrice)}</span>
                    {createForm.items.length > 1 && (
                      <button type="button" onClick={() => setCreateForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-2 text-sm font-medium text-gray-700">
                Total: {fmt(createForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
              <button onClick={handleCreate} disabled={saving || !createForm.supplierId || !createForm.items.some(i => i.productId)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Menyimpan...' : 'Buat PO'}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleCancel} title="Batalkan Purchase Order"
          message={`Apakah Anda yakin ingin membatalkan PO "${selectedPO?.po_number}"?`}
          confirmText="Batalkan" variant="danger" />
      </div>
    </HQLayout>
  );
}
