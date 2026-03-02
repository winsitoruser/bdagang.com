import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HQLayout from '../../../components/hq/HQLayout';
import {
  Package,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronLeft,
  Building2,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  ArrowRightLeft,
  Plus,
  X,
  Check,
  ChevronDown
} from 'lucide-react';

interface ProductStock {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  totalStock: number;
  minStock: number;
  maxStock: number;
  avgCost: number;
  stockValue: number;
  movement: 'fast' | 'medium' | 'slow';
  branches: BranchStockDetail[];
}

interface BranchStockDetail {
  branchId: string;
  branchName: string;
  branchCode: string;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'normal' | 'low' | 'out' | 'over';
  lastUpdated: string;
}

const categories = ['Semua Kategori', 'Bahan Pokok', 'Minuman', 'Snack', 'Frozen', 'Non-Food'];

export default function GlobalStockManagement() {
  const router = useRouter();
  const { branch } = router.query;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [branches, setBranches] = useState<{id: string, name: string, code: string}[]>([{id: 'all', name: 'Semua Cabang', code: 'ALL'}]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(branch as string || 'all');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'over'>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProductForTransfer, setSelectedProductForTransfer] = useState<ProductStock | null>(null);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'Semua Kategori') params.append('category', selectedCategory);
      if (stockFilter !== 'all') params.append('stockFilter', stockFilter);
      
      const response = await fetch(`/api/hq/inventory/stock?${params.toString()}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.products) setProducts(payload.products);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStock();
    if (branch) {
      setSelectedBranch(branch as string);
    }
  }, [branch]);

  if (!mounted) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatNumber = (value: number) => value.toLocaleString('id-ID');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Normal</span>;
      case 'low': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Low Stock</span>;
      case 'out': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Out of Stock</span>;
      case 'over': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Over Stock</span>;
      default: return null;
    }
  };

  const getMovementBadge = (movement: string) => {
    switch (movement) {
      case 'fast': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Fast Moving</span>;
      case 'medium': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Medium</span>;
      case 'slow': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Slow Moving</span>;
      default: return null;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Semua Kategori' || product.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter !== 'all') {
      const hasIssue = product.branches.some(b => b.status === stockFilter);
      matchesStock = hasIssue;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalStats = {
    totalProducts: filteredProducts.length,
    totalStock: filteredProducts.reduce((sum, p) => sum + p.totalStock, 0),
    totalValue: filteredProducts.reduce((sum, p) => sum + p.stockValue, 0),
    lowStockCount: filteredProducts.filter(p => p.branches.some(b => b.status === 'low')).length,
    outOfStockCount: filteredProducts.filter(p => p.branches.some(b => b.status === 'out')).length
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
              <h1 className="text-2xl font-bold text-gray-900">Global Stock Management</h1>
              <p className="text-gray-500">Monitoring stok produk di seluruh cabang</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Produk</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(totalStats.totalProducts)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Unit</p>
            <p className="text-xl font-bold text-gray-900">{formatNumber(totalStats.totalStock)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Nilai Stok</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalStats.totalValue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-yellow-200 p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Low Stock</p>
            <p className="text-xl font-bold text-yellow-700">{totalStats.lowStockCount} produk</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 bg-red-50">
            <p className="text-sm text-red-600">Out of Stock</p>
            <p className="text-xl font-bold text-red-700">{totalStats.outOfStockCount} produk</p>
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
                  placeholder="Cari produk, SKU, atau barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {branches.map(b => (
                <option key={b.id} value={b.code}>{b.name}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-2 text-sm ${stockFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-2 text-sm ${stockFilter === 'low' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-2 text-sm ${stockFilter === 'out' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Out of Stock
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Stok</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min/Max</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nilai Stok</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Movement</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const hasIssue = product.branches.some(b => b.status === 'low' || b.status === 'out');
                const isExpanded = expandedProduct === product.id;
                
                return (
                  <React.Fragment key={product.id}>
                    <tr className={`hover:bg-gray-50 ${hasIssue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku} • {product.barcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{product.category}</td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">{formatNumber(product.totalStock)} {product.unit}</td>
                      <td className="px-5 py-4 text-right text-gray-500 text-sm">{formatNumber(product.minStock)} / {formatNumber(product.maxStock)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(product.stockValue)}</td>
                      <td className="px-5 py-4 text-center">{getMovementBadge(product.movement)}</td>
                      <td className="px-5 py-4 text-center">
                        {product.branches.some(b => b.status === 'out') ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1 justify-center">
                            <AlertTriangle className="w-3 h-3" /> Kritis
                          </span>
                        ) : product.branches.some(b => b.status === 'low') ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Low Stock</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Normal</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedProductForTransfer(product); setShowTransferModal(true); }}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                            title="Transfer Stok"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-5 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {product.branches.map((branch) => (
                              <div
                                key={branch.branchId}
                                className={`p-3 rounded-lg border ${
                                  branch.status === 'out' ? 'bg-red-50 border-red-200' :
                                  branch.status === 'low' ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  {branch.branchCode.startsWith('WH') ? (
                                    <Warehouse className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <Building2 className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="text-xs font-medium text-gray-700">{branch.branchName}</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{formatNumber(branch.stock)}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">Min: {branch.minStock}</span>
                                  {getStatusBadge(branch.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Transfer Modal */}
        {showTransferModal && selectedProductForTransfer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Transfer Stok</h2>
                <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedProductForTransfer.name}</p>
                  <p className="text-sm text-gray-500">{selectedProductForTransfer.sku}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Cabang</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      {branches.filter(b => b.id !== 'all').map(b => (
                        <option key={b.id} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ke Cabang</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      {branches.filter(b => b.id !== 'all').map(b => (
                        <option key={b.id} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Transfer</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Alasan transfer..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowTransferModal(false)}
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
      </div>
    </HQLayout>
  );
}
