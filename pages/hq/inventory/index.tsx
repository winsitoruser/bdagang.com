import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HQLayout from '../../../components/hq/HQLayout';
import ProductFormModal from '../../../components/hq/inventory/ProductFormModal';
import {
  Package,
  RefreshCw,
  Download,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  Box,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Plus,
  Bell,
  ShoppingCart,
  Truck,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overStockItems: number;
  pendingTransfers: number;
  pendingOrders: number;
}

interface BranchStock {
  id: string;
  name: string;
  code: string;
  totalProducts: number;
  totalStock: number;
  stockValue: number;
  lowStock: number;
  outOfStock: number;
  overStock: number;
  lastSync: string;
  status: 'synced' | 'pending' | 'error';
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  stockValue: number;
  movement: 'fast' | 'medium' | 'slow';
  trend: number;
}

interface RecentActivity {
  id: string;
  type: 'transfer' | 'adjustment' | 'receipt' | 'return' | 'stocktake';
  description: string;
  branch: string;
  quantity: number;
  timestamp: string;
  user: string;
}

const mockSummary: InventorySummary = {
  totalProducts: 1250,
  totalStock: 85200,
  totalValue: 4780000000,
  lowStockItems: 65,
  outOfStockItems: 12,
  overStockItems: 89,
  pendingTransfers: 15,
  pendingOrders: 8
};

const mockBranchStock: BranchStock[] = [
  { id: '1', name: 'Gudang Pusat', code: 'WH-001', totalProducts: 1250, totalStock: 45000, stockValue: 2500000000, lowStock: 22, outOfStock: 0, overStock: 35, lastSync: '2 menit lalu', status: 'synced' },
  { id: '2', name: 'Cabang Pusat Jakarta', code: 'HQ-001', totalProducts: 856, totalStock: 12500, stockValue: 850000000, lowStock: 5, outOfStock: 0, overStock: 12, lastSync: '5 menit lalu', status: 'synced' },
  { id: '3', name: 'Cabang Bandung', code: 'BR-002', totalProducts: 742, totalStock: 8200, stockValue: 450000000, lowStock: 12, outOfStock: 3, overStock: 5, lastSync: '10 menit lalu', status: 'synced' },
  { id: '4', name: 'Cabang Surabaya', code: 'BR-003', totalProducts: 738, totalStock: 7500, stockValue: 380000000, lowStock: 8, outOfStock: 2, overStock: 8, lastSync: '15 menit lalu', status: 'pending' },
  { id: '5', name: 'Cabang Medan', code: 'BR-004', totalProducts: 625, totalStock: 5800, stockValue: 320000000, lowStock: 15, outOfStock: 5, overStock: 3, lastSync: '1 jam lalu', status: 'error' },
  { id: '6', name: 'Cabang Yogyakarta', code: 'BR-005', totalProducts: 630, totalStock: 6200, stockValue: 280000000, lowStock: 3, outOfStock: 1, overStock: 6, lastSync: '8 menit lalu', status: 'synced' }
];

const mockTopProducts: TopProduct[] = [
  { id: '1', name: 'Beras Premium 5kg', sku: 'BRS-001', category: 'Bahan Pokok', totalStock: 2500, stockValue: 375000000, movement: 'fast', trend: 15 },
  { id: '2', name: 'Minyak Goreng 2L', sku: 'MYK-001', category: 'Bahan Pokok', totalStock: 1800, stockValue: 126000000, movement: 'fast', trend: 8 },
  { id: '3', name: 'Gula Pasir 1kg', sku: 'GLA-001', category: 'Bahan Pokok', totalStock: 3200, stockValue: 51200000, movement: 'medium', trend: -3 },
  { id: '4', name: 'Kopi Arabica 250g', sku: 'KPI-001', category: 'Minuman', totalStock: 450, stockValue: 67500000, movement: 'medium', trend: 12 },
  { id: '5', name: 'Susu UHT 1L', sku: 'SSU-001', category: 'Minuman', totalStock: 2100, stockValue: 37800000, movement: 'fast', trend: 5 }
];

const mockActivities: RecentActivity[] = [
  { id: '1', type: 'transfer', description: 'Transfer stok ke Cabang Bandung', branch: 'Gudang Pusat', quantity: 500, timestamp: '10 menit lalu', user: 'Admin Gudang' },
  { id: '2', type: 'receipt', description: 'Penerimaan barang dari supplier', branch: 'Gudang Pusat', quantity: 1200, timestamp: '30 menit lalu', user: 'Staff Gudang' },
  { id: '3', type: 'adjustment', description: 'Penyesuaian stok (rusak)', branch: 'Cabang Jakarta', quantity: -25, timestamp: '1 jam lalu', user: 'Manager Cabang' },
  { id: '4', type: 'return', description: 'Retur barang ke supplier', branch: 'Cabang Surabaya', quantity: -50, timestamp: '2 jam lalu', user: 'Staff Gudang' },
  { id: '5', type: 'stocktake', description: 'Stock opname selesai', branch: 'Cabang Medan', quantity: 0, timestamp: '3 jam lalu', user: 'Supervisor' }
];

export default function HQInventoryDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InventorySummary>(mockSummary);
  const [branchStock, setBranchStock] = useState<BranchStock[]>(mockBranchStock);
  const [topProducts, setTopProducts] = useState<TopProduct[]>(mockTopProducts);
  const [activities, setActivities] = useState<RecentActivity[]>(mockActivities);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [branches, setBranches] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, branchesRes] = await Promise.all([
        fetch('/api/hq/inventory/products?limit=100&offset=0'),
        fetch('/api/hq/branches?limit=100')
      ]);
      
      if (productsRes.ok) {
        const result = await productsRes.json();
        const products = result.data || [];
        
        const totalProducts = products.length;
        const totalStock = products.reduce((sum: number, p: any) => {
          const stockSum = p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0;
          return sum + stockSum;
        }, 0);
        const totalValue = products.reduce((sum: number, p: any) => {
          const stockSum = p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0;
          return sum + (stockSum * parseFloat(p.costPrice || 0));
        }, 0);
        
        const lowStockItems = products.filter((p: any) => {
          const stockSum = p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0;
          return p.reorderPoint && stockSum <= p.reorderPoint;
        }).length;
        
        const outOfStockItems = products.filter((p: any) => {
          const stockSum = p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0;
          return stockSum === 0;
        }).length;
        
        setSummary({
          ...mockSummary,
          totalProducts,
          totalStock,
          totalValue,
          lowStockItems,
          outOfStockItems
        });
        
        const topProds = products.slice(0, 5).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          totalStock: p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0,
          stockValue: (p.stocks?.reduce((s: number, st: any) => s + st.quantity, 0) || 0) * parseFloat(p.costPrice || 0),
          movement: 'medium' as const,
          trend: 0
        }));
        
        setTopProducts(topProds.length > 0 ? topProds : mockTopProducts);
      } else {
        setSummary(mockSummary);
        setTopProducts(mockTopProducts);
      }
      
      if (branchesRes.ok) {
        const branchJson = await branchesRes.json();
        const branchPayload = branchJson.data || branchJson;
        setBranches(branchPayload.branches || []);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setSummary(mockSummary);
      setTopProducts(mockTopProducts);
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
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatNumber = (value: number) => value.toLocaleString('id-ID');

  const stockTrendOptions: ApexCharts.ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    colors: ['#3B82F6', '#10B981'],
    xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], labels: { style: { fontSize: '11px' } } },
    yaxis: { labels: { formatter: (val) => formatNumber(val) } },
    legend: { position: 'top' },
    dataLabels: { enabled: false }
  };

  const stockTrendSeries = [
    { name: 'Stock In', data: [1200, 980, 1500, 1100, 1350, 800, 950] },
    { name: 'Stock Out', data: [850, 1100, 900, 1200, 1000, 600, 750] }
  ];

  const categoryStockOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: ['Bahan Pokok', 'Minuman', 'Snack', 'Frozen', 'Non-Food'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` }
  };

  const categoryStockSeries = [35, 25, 20, 12, 8];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transfer': return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      case 'receipt': return <Package className="w-4 h-4 text-green-600" />;
      case 'adjustment': return <Settings className="w-4 h-4 text-orange-600" />;
      case 'return': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'stocktake': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <Box className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced': return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" />Synced</span>;
      case 'pending': return <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="w-3 h-3" />Pending</span>;
      case 'error': return <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="w-3 h-3" />Error</span>;
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

  const quickLinks = [
    { icon: Package, label: 'Stok Global', href: '/hq/inventory/stock', color: 'bg-blue-500' },
    { icon: Box, label: 'Kategori', href: '/hq/inventory/categories', color: 'bg-teal-500' },
    { icon: BarChart3, label: 'Harga & Pricing', href: '/hq/inventory/pricing', color: 'bg-emerald-500' },
    { icon: ArrowRightLeft, label: 'Transfer Stok', href: '/hq/inventory/transfers', color: 'bg-purple-500' },
    { icon: Bell, label: 'Alerts', href: '/hq/inventory/alerts', color: 'bg-orange-500' },
    { icon: FileText, label: 'Stock Opname', href: '/hq/inventory/stocktake', color: 'bg-green-500' },
    { icon: Truck, label: 'Penerimaan', href: '/hq/inventory/receipts', color: 'bg-indigo-500' },
    { icon: ShoppingCart, label: 'Purchase Orders', href: '/hq/purchase-orders', color: 'bg-cyan-500' }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Inventory Management</h1>
            <p className="text-gray-500">Monitoring dan pengelolaan stok seluruh cabang</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Sync All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link, idx) => (
            <Link key={idx} href={link.href} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className={`w-9 h-9 ${link.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <link.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />+5.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalProducts)}</p>
            <p className="text-sm text-gray-500">Total Produk</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" />+12.8%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalStock)}</p>
            <p className="text-sm text-gray-500">Total Unit Stok</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalValue)}</p>
            <p className="text-sm text-gray-500">Nilai Stok</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <Link href="/hq/inventory/alerts" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.lowStockItems + summary.outOfStockItems}</p>
            <p className="text-sm text-gray-500">Items Perlu Perhatian</p>
          </div>
        </div>

        {/* Alert Banner */}
        {(summary.outOfStockItems > 0 || summary.lowStockItems > 10) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Perhatian: Stok Kritis Terdeteksi</p>
                <p className="text-sm text-red-600">{summary.outOfStockItems} produk habis stok, {summary.lowStockItems} produk stok rendah di beberapa cabang</p>
              </div>
            </div>
            <Link href="/hq/inventory/alerts" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Review Sekarang
            </Link>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tren Pergerakan Stok</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span>Stock In</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span>Stock Out</span>
              </div>
            </div>
            <Chart options={stockTrendOptions} series={stockTrendSeries} type="area" height={280} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi Stok per Kategori</h3>
            <Chart options={categoryStockOptions} series={categoryStockSeries} type="donut" height={280} />
          </div>
        </div>

        {/* Branch Stock Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Stok per Cabang</h3>
            <Link href="/hq/inventory/stock" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Lihat Detail <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Produk</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Stok</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nilai Stok</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Low Stock</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Out of Stock</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sync Status</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchStock.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          {branch.code.startsWith('WH') ? <Warehouse className="w-4 h-4 text-gray-600" /> : <Building2 className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-500">{branch.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatNumber(branch.totalProducts)}</td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">{formatNumber(branch.totalStock)}</td>
                    <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(branch.stockValue)}</td>
                    <td className="px-5 py-4 text-center">
                      {branch.lowStock > 0 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">{branch.lowStock}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {branch.outOfStock > 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">{branch.outOfStock}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-center">
                        {getStatusBadge(branch.status)}
                        <span className="text-xs text-gray-400 mt-1">{branch.lastSync}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link href={`/hq/inventory/stock?branch=${branch.code}`} className="p-2 hover:bg-gray-100 rounded-lg inline-flex">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Produk Teratas (Stok Terbanyak)</h3>
              <Link href="/hq/inventory/stock" className="text-sm text-blue-600 hover:underline">Lihat Semua</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {topProducts.map((product) => (
                <div key={product.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku} • {product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatNumber(product.totalStock)} unit</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      {getMovementBadge(product.movement)}
                      <span className={`text-xs flex items-center gap-1 ${product.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(product.trend)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
            </div>
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.branch} • {activity.user}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${activity.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {activity.quantity >= 0 ? '+' : ''}{formatNumber(activity.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/hq/inventory/transfers" className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Transfer Pending</p>
                <p className="text-3xl font-bold mt-1">{summary.pendingTransfers}</p>
                <p className="text-purple-200 text-sm mt-2">Menunggu approval atau pengiriman</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="w-8 h-8" />
              </div>
            </div>
          </Link>

          <Link href="/hq/purchase-orders" className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Purchase Orders Pending</p>
                <p className="text-3xl font-bold mt-1">{summary.pendingOrders}</p>
                <p className="text-cyan-200 text-sm mt-2">Menunggu konfirmasi supplier</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </HQLayout>
  );
}
