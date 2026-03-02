import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  Package,
  RefreshCw,
  Download,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  Box,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface StockData {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalProducts: number;
  totalStock: number;
  stockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overStockItems: number;
  lastUpdated: string;
}

interface ProductStock {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  branches: { branchId: string; branchName: string; stock: number; minStock: number; status: string }[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function InventoryReport() {
  const [mounted, setMounted] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/reports/inventory');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.stockData) setStockData(payload.stockData);
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStockData();
  }, []);

  if (!mounted) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const exportToCSV = () => {
    const headers = ['Cabang', 'Kode', 'Total Produk', 'Total Stok', 'Nilai Stok', 'Low Stock', 'Out of Stock', 'Over Stock'];
    const rows = stockData.map(s => [
      s.branchName, s.branchCode, s.totalProducts, s.totalStock, s.stockValue, s.lowStockItems, s.outOfStockItems, s.overStockItems
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalStats = {
    totalStock: stockData.reduce((sum, s) => sum + s.totalStock, 0),
    totalValue: stockData.reduce((sum, s) => sum + s.stockValue, 0),
    lowStock: stockData.reduce((sum, s) => sum + s.lowStockItems, 0),
    outOfStock: stockData.reduce((sum, s) => sum + s.outOfStockItems, 0),
    overStock: stockData.reduce((sum, s) => sum + s.overStockItems, 0)
  };

  const stockDistributionData = stockData.map(s => ({
    name: s.branchName.replace('Cabang ', '').replace('Gudang ', ''),
    value: s.stockValue / 1000000
  }));

  const stockStatusData = [
    { name: 'Normal', value: stockData.reduce((sum, s) => sum + s.totalProducts - s.lowStockItems - s.outOfStockItems - s.overStockItems, 0), color: '#10B981' },
    { name: 'Low Stock', value: totalStats.lowStock, color: '#F59E0B' },
    { name: 'Out of Stock', value: totalStats.outOfStock, color: '#EF4444' },
    { name: 'Over Stock', value: totalStats.overStock, color: '#3B82F6' }
  ];

  return (
    <HQLayout title="Laporan Inventori" subtitle="Pantau stok di seluruh cabang">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Box className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalStock.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Stok</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalStats.totalValue)}</p>
                <p className="text-sm text-gray-500">Nilai Stok</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{totalStats.lowStock}</p>
                <p className="text-sm text-gray-500">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{totalStats.outOfStock}</p>
                <p className="text-sm text-gray-500">Out of Stock</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{totalStats.overStock}</p>
                <p className="text-sm text-gray-500">Over Stock</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi Nilai Stok per Cabang (Juta)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`Rp ${value.toFixed(0)} Jt`, 'Nilai']} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status Stok</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari cabang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchStockData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cabang</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Produk</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Total Stok</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Nilai Stok</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Low Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Out of Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Over Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData
                    .filter(s => s.branchName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((stock) => (
                    <tr key={stock.branchId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{stock.branchName}</p>
                            <p className="text-sm text-gray-500">{stock.branchCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{stock.totalProducts}</td>
                      <td className="py-3 px-4 text-center font-medium">{stock.totalStock.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(stock.stockValue)}</td>
                      <td className="py-3 px-4 text-center">
                        {stock.lowStockItems > 0 ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            {stock.lowStockItems}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {stock.outOfStockItems > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {stock.outOfStockItems}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {stock.overStockItems > 0 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {stock.overStockItems}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-500">
                        {new Date(stock.lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
