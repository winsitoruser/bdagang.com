import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, AlertTriangle, Package, TrendingDown,
  TrendingUp, RefreshCw, Download, Filter, Edit
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  lastRestocked: Date;
  status: 'good' | 'low' | 'critical' | 'overstock';
}

const KitchenInventoryPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const MOCK_K_INV: InventoryItem[] = [
    { id: 'ki1', name: 'Ayam Potong', category: 'Protein', currentStock: 15, unit: 'kg', minStock: 5, maxStock: 50, reorderPoint: 10, unitCost: 45000, totalValue: 675000, lastRestocked: new Date('2026-03-14'), status: 'good' },
    { id: 'ki2', name: 'Beras Premium', category: 'Karbohidrat', currentStock: 8, unit: 'kg', minStock: 10, maxStock: 100, reorderPoint: 20, unitCost: 15000, totalValue: 120000, lastRestocked: new Date('2026-03-12'), status: 'low' },
    { id: 'ki3', name: 'Minyak Goreng', category: 'Minyak', currentStock: 2, unit: 'liter', minStock: 5, maxStock: 30, reorderPoint: 8, unitCost: 18000, totalValue: 36000, lastRestocked: new Date('2026-03-10'), status: 'critical' },
    { id: 'ki4', name: 'Telur', category: 'Protein', currentStock: 120, unit: 'butir', minStock: 30, maxStock: 100, reorderPoint: 50, unitCost: 2500, totalValue: 300000, lastRestocked: new Date('2026-03-15'), status: 'overstock' },
  ];
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_K_INV);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch inventory data from API
  useEffect(() => {
    fetchInventory();
  }, [filterStatus, searchQuery]);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/kitchen/inventory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory(MOCK_K_INV);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      good: 'bg-green-100 text-green-800 border-green-200',
      low: 'bg-amber-100 text-amber-800 border-amber-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
      overstock: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    const labels = {
      good: 'Stok Baik',
      low: 'Stok Rendah',
      critical: 'Kritis',
      overstock: 'Overstock'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getStockPercentage = (current: number, max: number) => {
    return (current / max * 100).toFixed(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: inventory.length,
    critical: inventory.filter(i => i.status === 'critical').length,
    low: inventory.filter(i => i.status === 'low').length,
    totalValue: inventory.reduce((acc, item) => acc + item.totalValue, 0)
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Stok Bahan Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Stok Bahan Dapur</h1>
              <p className="text-gray-600">Monitor dan kelola stok bahan masakan</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Item
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stok Kritis</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stok Rendah</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.low}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari bahan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className={filterStatus === 'all' ? 'bg-sky-500 hover:bg-sky-600' : ''}
                >
                  Semua
                </Button>
                <Button
                  variant={filterStatus === 'critical' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('critical')}
                  className={filterStatus === 'critical' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  Kritis
                </Button>
                <Button
                  variant={filterStatus === 'low' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('low')}
                  className={filterStatus === 'low' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  Rendah
                </Button>
                <Button
                  variant={filterStatus === 'good' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('good')}
                  className={filterStatus === 'good' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  Baik
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stock Level */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Stok Saat Ini</span>
                      <span className="text-lg font-bold text-gray-900">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'critical' ? 'bg-red-500' :
                          item.status === 'low' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>Min: {item.minStock}</span>
                      <span>Max: {item.maxStock}</span>
                    </div>
                  </div>

                  {/* Reorder Point */}
                  {item.currentStock <= item.reorderPoint && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                        <span className="text-sm text-amber-800">
                          Reorder Point: {item.reorderPoint} {item.unit}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Value */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Harga/Unit</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.unitCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total Nilai</span>
                      <span className="text-sm font-bold text-sky-600">
                        {formatCurrency(item.totalValue)}
                      </span>
                    </div>
                  </div>

                  {/* Last Restocked */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Terakhir Restock</span>
                    <span className="text-gray-900">{formatDate(item.lastRestocked)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Restock
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenInventoryPage;
