import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HQLayout from '../../../components/hq/HQLayout';
import {
  DollarSign,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Percent,
  Tag,
  MapPin,
  Building2,
  Lock,
  Unlock,
  Eye,
  Copy,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  X,
  Check,
  Filter,
  Download
} from 'lucide-react';

interface PriceTier {
  id: string;
  code: string;
  name: string;
  description: string;
  multiplier: number;
  markupPercent: number;
  region: string;
  appliedBranches: number;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

interface ProductPrice {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  basePrice: number;
  costPrice: number;
  margin: number;
  tierPrices: { tierId: string; tierName: string; price: number }[];
  isLocked: boolean;
  lockedBy: string | null;
}

const categories = ['Semua Kategori', 'Sembako', 'Minuman', 'Snack', 'Frozen', 'Non-Food'];

export default function InventoryPricing() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tiers' | 'products'>('tiers');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [showLockedOnly, setShowLockedOnly] = useState(false);
  
  // Modals
  const [showTierModal, setShowTierModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductPrice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tierForm, setTierForm] = useState({
    code: '',
    name: '',
    description: '',
    multiplier: 1.0,
    markupPercent: 0,
    region: 'Nasional'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tiersRes, pricesRes] = await Promise.all([
        fetch('/api/hq/inventory/pricing?type=tiers'),
        fetch('/api/hq/inventory/pricing?type=products')
      ]);
      
      if (tiersRes.ok) {
        const json1 = await tiersRes.json();
        const p1 = json1.data || json1;
        if (p1.priceTiers) setPriceTiers(p1.priceTiers);
      }
      
      if (pricesRes.ok) {
        const json2 = await pricesRes.json();
        const p2 = json2.data || json2;
        if (p2.productPrices) setProductPrices(p2.productPrices);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const handleCreateTier = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/hq/inventory/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tierForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        setPriceTiers(prev => [...prev, data.priceTier || {
          id: Date.now().toString(),
          ...tierForm,
          appliedBranches: 0,
          productCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        }]);
      } else {
        // Fallback to local
        setPriceTiers(prev => [...prev, {
          id: Date.now().toString(),
          ...tierForm,
          appliedBranches: 0,
          productCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      setPriceTiers(prev => [...prev, {
        id: Date.now().toString(),
        ...tierForm,
        appliedBranches: 0,
        productCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
    }
    setSaving(false);
    setShowTierModal(false);
    resetTierForm();
  };

  const handleUpdateTier = async () => {
    if (!selectedTier) return;
    setSaving(true);
    try {
      const response = await fetch('/api/hq/inventory/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTier.id, ...tierForm })
      });
      
      setPriceTiers(prev => prev.map(t => 
        t.id === selectedTier.id ? { ...t, ...tierForm } : t
      ));
    } catch (error) {
      setPriceTiers(prev => prev.map(t => 
        t.id === selectedTier.id ? { ...t, ...tierForm } : t
      ));
    }
    setSaving(false);
    setShowTierModal(false);
    setSelectedTier(null);
    setIsEditing(false);
    resetTierForm();
  };

  const handleDeleteTier = async () => {
    if (!selectedTier) return;
    try {
      await fetch('/api/hq/inventory/pricing', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedTier.id })
      });
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
    setPriceTiers(prev => prev.filter(t => t.id !== selectedTier.id));
    setShowDeleteConfirm(false);
    setSelectedTier(null);
  };

  const handleToggleLock = async (product: ProductPrice) => {
    const newLockState = !product.isLocked;
    try {
      await fetch('/api/hq/inventory/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.productId, 
          isLocked: newLockState,
          lockedBy: newLockState ? 'Admin HQ' : null
        })
      });
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
    setProductPrices(prev => prev.map(p => 
      p.id === product.id 
        ? { ...p, isLocked: newLockState, lockedBy: newLockState ? 'Admin HQ' : null }
        : p
    ));
  };

  const handleToggleTierStatus = async (tier: PriceTier) => {
    const newStatus = !tier.isActive;
    setPriceTiers(prev => prev.map(t => 
      t.id === tier.id ? { ...t, isActive: newStatus } : t
    ));
  };

  const resetTierForm = () => {
    setTierForm({ code: '', name: '', description: '', multiplier: 1.0, markupPercent: 0, region: 'Nasional' });
  };

  const openEditTier = (tier: PriceTier) => {
    setSelectedTier(tier);
    setTierForm({
      code: tier.code,
      name: tier.name,
      description: tier.description,
      multiplier: tier.multiplier,
      markupPercent: tier.markupPercent,
      region: tier.region
    });
    setIsEditing(true);
    setShowTierModal(true);
  };

  const filteredTiers = priceTiers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = productPrices.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
    const matchesLock = !showLockedOnly || p.isLocked;
    return matchesSearch && matchesCategory && matchesLock;
  });

  const stats = {
    totalTiers: priceTiers.length,
    activeTiers: priceTiers.filter(t => t.isActive).length,
    totalProducts: productPrices.length,
    lockedProducts: productPrices.filter(p => p.isLocked).length
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
              <h1 className="text-2xl font-bold text-gray-900">Harga & Price Tier</h1>
              <p className="text-gray-500">Kelola tier harga dan pricing produk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTiers}</p>
                <p className="text-sm text-gray-500">Price Tiers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTiers}</p>
                <p className="text-sm text-gray-500">Tier Aktif</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500">Produk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.lockedProducts}</p>
                <p className="text-sm text-gray-500">Harga Terkunci</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => { setActiveTab('tiers'); setSearchTerm(''); }}
                className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === 'tiers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Price Tiers
              </button>
              <button
                onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
                className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Harga Produk
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'tiers' ? 'Cari tier...' : 'Cari produk...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {activeTab === 'products' && (
                  <>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showLockedOnly}
                        onChange={(e) => setShowLockedOnly(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Hanya Terkunci
                    </label>
                  </>
                )}
              </div>
              {activeTab === 'tiers' && (
                <button
                  onClick={() => { resetTierForm(); setIsEditing(false); setShowTierModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tier
                </button>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : activeTab === 'tiers' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Tier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Multiplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Markup</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cabang</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Produk</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTiers.map((tier) => (
                      <tr key={tier.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">{tier.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{tier.name}</p>
                          <p className="text-sm text-gray-500">{tier.description}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {tier.region}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{tier.multiplier}x</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${tier.markupPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tier.markupPercent >= 0 ? '+' : ''}{tier.markupPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{tier.appliedBranches}</td>
                        <td className="px-4 py-3 text-center">{tier.productCount}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleTierStatus(tier)}
                            className={`px-2 py-1 rounded text-xs ${tier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {tier.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditTier(tier)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedTier(tier); setShowDeleteConfirm(true); }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              disabled={tier.code === 'STD'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Pokok</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Jual</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                      {priceTiers.filter(t => t.isActive).slice(0, 3).map(tier => (
                        <th key={tier.id} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{tier.name}</th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lock</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.category}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(product.costPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.basePrice)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${product.margin >= 20 ? 'bg-green-100 text-green-700' : product.margin >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {product.margin.toFixed(1)}%
                          </span>
                        </td>
                        {priceTiers.filter(t => t.isActive).slice(0, 3).map(tier => {
                          const tierPrice = product.tierPrices.find(tp => tp.tierId === tier.id);
                          return (
                            <td key={tier.id} className="px-4 py-3 text-right">
                              {tierPrice ? formatCurrency(tierPrice.price) : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleLock(product)}
                            className={`p-2 rounded-lg ${product.isLocked ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          >
                            {product.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelectedProduct(product); setShowPriceModal(true); }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Tier Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Price Tier' : 'Tambah Price Tier'}</h2>
                <button onClick={() => setShowTierModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode *</label>
                    <input
                      type="text"
                      value={tierForm.code}
                      onChange={(e) => setTierForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="STD, MALL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                    <input
                      type="text"
                      value={tierForm.name}
                      onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Harga Standar"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={tierForm.description}
                    onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tierForm.multiplier}
                      onChange={(e) => setTierForm(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Markup (%)</label>
                    <input
                      type="number"
                      value={tierForm.markupPercent}
                      onChange={(e) => setTierForm(prev => ({ ...prev, markupPercent: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={tierForm.region}
                    onChange={(e) => setTierForm(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Nasional"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowTierModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button
                  onClick={isEditing ? handleUpdateTier : handleCreateTier}
                  disabled={saving || !tierForm.code || !tierForm.name}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price Edit Modal */}
        {showPriceModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Harga</h2>
                <button onClick={() => setShowPriceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedProduct.productName}</p>
                      <p className="text-sm text-gray-500">{selectedProduct.sku} • {selectedProduct.category}</p>
                    </div>
                    <button
                      onClick={() => handleToggleLock(selectedProduct)}
                      className={`p-2 rounded-lg ${selectedProduct.isLocked ? 'text-purple-600 bg-purple-100' : 'text-gray-400 bg-gray-100'}`}
                    >
                      {selectedProduct.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Pokok</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct.costPrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={selectedProduct.isLocked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual Dasar</label>
                    <input
                      type="number"
                      defaultValue={selectedProduct.basePrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={selectedProduct.isLocked}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Tier</label>
                  <div className="space-y-2">
                    {priceTiers.filter(t => t.isActive).map(tier => {
                      const tierPrice = selectedProduct.tierPrices.find(tp => tp.tierId === tier.id);
                      return (
                        <div key={tier.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">{tier.name}</p>
                            <p className="text-xs text-gray-500">{tier.markupPercent >= 0 ? '+' : ''}{tier.markupPercent}%</p>
                          </div>
                          <input
                            type="number"
                            defaultValue={tierPrice?.price || Math.round(selectedProduct.basePrice * tier.multiplier)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-right"
                            disabled={selectedProduct.isLocked}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedProduct.isLocked && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">Harga terkunci oleh {selectedProduct.lockedBy}. Unlock untuk mengedit.</span>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowPriceModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button
                  disabled={selectedProduct.isLocked}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && selectedTier && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Price Tier</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus tier "{selectedTier.name}"? Aksi ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={handleDeleteTier} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
