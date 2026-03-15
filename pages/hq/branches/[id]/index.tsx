import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HQLayout from '@/components/hq/HQLayout';
import { StatusBadge } from '@/components/hq/ui';
import dynamic from 'next/dynamic';
import {
  Building2, TrendingUp, TrendingDown, Users, Clock, ChefHat, 
  ShoppingCart, CreditCard, Table2, BarChart3, Activity, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Coffee, Utensils, Package,
  Timer, Target, Percent, DollarSign, ArrowUp, ArrowDown, Minus,
  Wifi, WifiOff, UserCheck, UserX, PlayCircle, PauseCircle,
  ClipboardList, MapPin, Phone, Mail, Settings, ArrowLeft
} from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BranchRealtimeData {
  branchId: string;
  lastUpdated: string;
  kitchen: any;
  queue: any;
  orders: any;
  occupancy: any;
  employees: any;
  sales: any;
  sla: any;
}

const MOCK_BRANCH_DETAIL = { id: 'b1', name: 'Cabang Jakarta Pusat', code: 'HQ-001', city: 'Jakarta', address: 'Jl. Sudirman No.1', phone: '021-1234567', email: 'jakarta@bedagang.co.id', manager: 'Budi Santoso', status: 'active', type: 'flagship', employeeCount: 25, openingDate: '2024-01-15' };
const MOCK_REALTIME: BranchRealtimeData = {
  branchId: 'b1', lastUpdated: new Date().toISOString(),
  kitchen: { activeOrders: 5, avgPrepTime: 12, pendingOrders: 3 },
  queue: { currentQueue: 8, avgWaitTime: 6, served: 142 },
  orders: { today: 185, completed: 172, cancelled: 3, avgValue: 125000 },
  occupancy: { current: 42, capacity: 60, percentage: 70 },
  employees: { present: 22, absent: 2, late: 1, onBreak: 3 },
  sales: { today: 23125000, target: 25000000, achievement: 92.5, transactions: 185 },
  sla: { onTime: 92, avgFulfillment: 8.5, breached: 3 },
};

export default function BranchDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<BranchRealtimeData | null>(MOCK_REALTIME);
  const [branch, setBranch] = useState<any>(MOCK_BRANCH_DETAIL);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchBranchData = async () => {
    if (!id) return;
    try {
      const [branchRes, realtimeRes] = await Promise.all([
        fetch(`/api/hq/branches/${id}`),
        fetch(`/api/hq/branches/${id}/realtime`)
      ]);
      
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        setBranch(branchData.branch || branchData);
      }
      
      if (realtimeRes.ok) {
        const realtimeData = await realtimeRes.json();
        setData(realtimeData);
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
      setBranch(MOCK_BRANCH_DETAIL);
      setData(MOCK_REALTIME);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id) {
      fetchBranchData();
    }
  }, [id]);

  useEffect(() => {
    if (!autoRefresh || !id) return;
    const interval = setInterval(fetchBranchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, id]);

  if (!mounted) return null;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)} menit`;
    return `${Math.floor(minutes / 60)}j ${Math.round(minutes % 60)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-600';
      case 'normal': return 'bg-green-100 text-green-600';
      case 'busy': return 'bg-yellow-100 text-yellow-600';
      case 'overloaded': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'kitchen', label: 'Dapur', icon: ChefHat },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'occupancy', label: 'Okupansi', icon: Table2 },
    { id: 'employees', label: 'Karyawan', icon: Users },
    { id: 'sla', label: 'SLA', icon: Target }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Penjualan Hari Ini</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data?.sales?.today || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Target: {formatCurrency(data?.sales?.target || 0)} ({data?.sales?.achievement || 0}%)
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm font-medium">Total Pesanan</span>
          </div>
          <p className="text-2xl font-bold">{data?.orders?.totalToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            Online: {data?.orders?.online || 0} | Offline: {data?.orders?.offline || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <ChefHat className="w-5 h-5" />
            <span className="text-sm font-medium">Status Kitchen</span>
          </div>
          <p className={`text-lg font-bold px-3 py-1 rounded-full inline-block ${getStatusColor(data?.kitchen?.status || 'idle')}`}>
            {(data?.kitchen?.status || 'idle').toUpperCase()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data?.kitchen?.activeOrders || 0} pesanan aktif
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Table2 className="w-5 h-5" />
            <span className="text-sm font-medium">Okupansi Meja</span>
          </div>
          <p className="text-2xl font-bold">{data?.occupancy?.percentage || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {data?.occupancy?.occupied || 0}/{data?.occupancy?.totalTables || 0} meja terisi
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Karyawan Hadir</span>
          </div>
          <p className="text-2xl font-bold">{data?.employees?.present || 0}/{data?.employees?.total || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {data?.employees?.onBreak || 0} sedang istirahat
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">SLA Compliance</span>
          </div>
          <p className="text-2xl font-bold">{data?.sla?.overallSLA || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {data?.sla?.breaches?.length || 0} pelanggaran
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Pendapatan Per Jam</h3>
          {mounted && data?.sales?.hourlyRevenue && (
            <Chart
              type="area"
              height={250}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#3B82F6'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
                xaxis: { categories: data.sales.hourlyRevenue.map((h: any) => h.hour) },
                yaxis: { labels: { formatter: (val: number) => formatCurrency(val) } },
                tooltip: { y: { formatter: (val: number) => formatCurrency(val) } }
              }}
              series={[{ name: 'Revenue', data: data.sales.hourlyRevenue.map((h: any) => h.revenue) }]}
            />
          )}
        </div>

        {/* Orders by Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Pesanan per Tipe</h3>
          {mounted && data?.orders && (
            <Chart
              type="donut"
              height={250}
              options={{
                chart: { toolbar: { show: false } },
                colors: ['#3B82F6', '#10B981', '#F59E0B'],
                labels: ['Dine-In', 'Takeaway', 'Delivery'],
                legend: { position: 'bottom' },
                dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` }
              }}
              series={[data.orders.dineIn || 0, data.orders.takeaway || 0, data.orders.delivery || 0]}
            />
          )}
        </div>
      </div>

      {/* Recent Orders & Kitchen Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Pesanan Terbaru</h3>
          <div className="space-y-3">
            {data?.orders?.recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.type} • {order.source} • {order.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-600' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Active Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Pesanan Kitchen Aktif</h3>
          <div className="space-y-3">
            {data?.kitchen?.activeItems?.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.orderNumber}</p>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">{item.items}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'ready' ? 'bg-green-100 text-green-600' :
                    item.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {item.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{item.elapsed}/{item.estimatedTime} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKitchenTab = () => (
    <div className="space-y-6">
      {/* Kitchen Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Status</p>
          <p className={`text-lg font-bold mt-1 px-3 py-1 rounded-full inline-block ${getStatusColor(data?.kitchen?.status || 'idle')}`}>
            {(data?.kitchen?.status || 'idle').toUpperCase()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Pesanan Aktif</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{data?.kitchen?.activeOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Menunggu</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{data?.kitchen?.pendingOrders || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Selesai Hari Ini</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{data?.kitchen?.completedToday || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Rata-rata Waktu</p>
          <p className="text-2xl font-bold mt-1">{data?.kitchen?.avgPrepTime || 0} min</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">SLA Compliance</p>
          <p className={`text-2xl font-bold mt-1 ${(data?.kitchen?.slaCompliance || 0) >= 90 ? 'text-green-600' : 'text-red-600'}`}>
            {data?.kitchen?.slaCompliance || 0}%
          </p>
        </div>
      </div>

      {/* Kitchen Orders Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">Pesanan Kitchen Per Jam</h3>
        {mounted && data?.kitchen?.ordersPerHour && (
          <Chart
            type="bar"
            height={300}
            options={{
              chart: { toolbar: { show: false } },
              colors: ['#F59E0B'],
              plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
              dataLabels: { enabled: false },
              xaxis: { categories: data.kitchen.ordersPerHour.map((h: any) => h.hour) },
              yaxis: { title: { text: 'Jumlah Pesanan' } }
            }}
            series={[{ name: 'Pesanan', data: data.kitchen.ordersPerHour.map((h: any) => h.orders) }]}
          />
        )}
      </div>

      {/* Active Kitchen Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">Pesanan Aktif di Kitchen</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Waktu Mulai</th>
                <th className="text-left py-3 px-4">Elapsed</th>
                <th className="text-left py-3 px-4">Target</th>
                <th className="text-left py-3 px-4">Progress</th>
              </tr>
            </thead>
            <tbody>
              {data?.kitchen?.activeItems?.map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.orderNumber}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] truncate">{item.items}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'ready' ? 'bg-green-100 text-green-600' :
                      item.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{item.startedAt ? new Date(item.startedAt).toLocaleTimeString('id-ID') : '-'}</td>
                  <td className="py-3 px-4">{item.elapsed} min</td>
                  <td className="py-3 px-4">{item.estimatedTime} min</td>
                  <td className="py-3 px-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.elapsed > item.estimatedTime ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((item.elapsed / item.estimatedTime) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Hari Ini</p>
          <p className="text-2xl font-bold mt-1">{data?.orders?.totalToday || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{data?.orders?.online || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Offline</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{data?.orders?.offline || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{data?.orders?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{data?.orders?.completed || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Avg. Order Value</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(data?.orders?.avgOrderValue || 0)}</p>
        </div>
      </div>

      {/* Orders by Source Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Pesanan Online vs Offline Per Jam</h3>
          {mounted && data?.orders?.hourlyOrders && (
            <Chart
              type="bar"
              height={300}
              options={{
                chart: { toolbar: { show: false }, stacked: true },
                colors: ['#3B82F6', '#10B981'],
                plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
                dataLabels: { enabled: false },
                xaxis: { categories: data.orders.hourlyOrders.map((h: any) => h.hour) },
                legend: { position: 'top' }
              }}
              series={[
                { name: 'Online', data: data.orders.hourlyOrders.map((h: any) => h.online) },
                { name: 'Offline', data: data.orders.hourlyOrders.map((h: any) => h.offline) }
              ]}
            />
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Distribusi Tipe Pesanan</h3>
          {mounted && data?.orders && (
            <Chart
              type="pie"
              height={300}
              options={{
                chart: { toolbar: { show: false } },
                colors: ['#3B82F6', '#10B981', '#F59E0B'],
                labels: ['Dine-In', 'Takeaway', 'Delivery'],
                legend: { position: 'bottom' }
              }}
              series={[data.orders.dineIn, data.orders.takeaway, data.orders.delivery]}
            />
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">Pesanan Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order #</th>
                <th className="text-left py-3 px-4">Tipe</th>
                <th className="text-left py-3 px-4">Source</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.type === 'dine_in' ? 'bg-blue-100 text-blue-600' :
                      order.type === 'takeaway' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.source === 'online' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-600' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOccupancyTab = () => (
    <div className="space-y-6">
      {/* Occupancy Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Okupansi</p>
          <p className="text-2xl font-bold mt-1">{data?.occupancy?.percentage || 0}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Meja</p>
          <p className="text-2xl font-bold mt-1">{data?.occupancy?.totalTables || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Terisi</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{data?.occupancy?.occupied || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Tersedia</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{data?.occupancy?.available || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Reserved</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{data?.occupancy?.reserved || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Avg. Turnover</p>
          <p className="text-2xl font-bold mt-1">{data?.occupancy?.avgTurnoverTime || 0} min</p>
        </div>
      </div>

      {/* Table Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">Status Meja Real-time</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {data?.occupancy?.tableStatus?.map((table: any) => (
            <div 
              key={table.id}
              className={`p-4 rounded-xl text-center border-2 ${
                table.status === 'occupied' ? 'bg-blue-50 border-blue-300' :
                table.status === 'reserved' ? 'bg-yellow-50 border-yellow-300' :
                'bg-green-50 border-green-300'
              }`}
            >
              <p className="font-bold text-lg">{table.number}</p>
              <p className="text-xs text-gray-500">{table.capacity} kursi</p>
              {table.status === 'occupied' && (
                <>
                  <p className="text-sm font-medium mt-2">{table.guests} tamu</p>
                  <p className="text-xs text-gray-500">{table.duration} min</p>
                </>
              )}
              {table.status === 'reserved' && (
                <p className="text-xs text-yellow-600 mt-2">Reserved</p>
              )}
              {table.status === 'available' && (
                <p className="text-xs text-green-600 mt-2">Tersedia</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 border border-blue-300"></div>
            <span>Terisi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-200 border border-yellow-300"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200 border border-green-300"></div>
            <span>Tersedia</span>
          </div>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Status Antrian</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Panjang Antrian</p>
              <p className="text-3xl font-bold text-blue-600">{data?.queue?.currentLength || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Waktu Tunggu Rata-rata</p>
              <p className="text-3xl font-bold">{data?.queue?.avgWaitTime || 0} min</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Dilayani Hari Ini</p>
              <p className="text-3xl font-bold text-green-600">{data?.queue?.servedToday || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Tingkat Kepuasan</p>
              <p className="text-3xl font-bold">{data?.queue?.serviceRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Tren Antrian</h3>
          {mounted && data?.queue?.queueTrend && (
            <Chart
              type="line"
              height={200}
              options={{
                chart: { toolbar: { show: false }, zoom: { enabled: false } },
                colors: ['#8B5CF6'],
                stroke: { curve: 'smooth', width: 3 },
                xaxis: { categories: data.queue.queueTrend.map((q: any) => q.time) },
                yaxis: { title: { text: 'Panjang Antrian' } }
              }}
              series={[{ name: 'Antrian', data: data.queue.queueTrend.map((q: any) => q.length) }]}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderEmployeesTab = () => (
    <div className="space-y-6">
      {/* Employee Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Karyawan</p>
          <p className="text-2xl font-bold mt-1">{data?.employees?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Hadir</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{data?.employees?.present || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Tidak Hadir</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{data?.employees?.absent || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Cuti</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{data?.employees?.onLeave || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Istirahat</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{data?.employees?.onBreak || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Kehadiran</p>
          <p className="text-2xl font-bold mt-1">{data?.employees?.attendance || 0}%</p>
        </div>
      </div>

      {/* Staff by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Karyawan per Role</h3>
          <div className="space-y-4">
            {data?.employees?.byRole && Object.entries(data.employees.byRole).map(([role, info]: [string, any]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    role === 'kitchen' ? 'bg-orange-100' :
                    role === 'cashier' ? 'bg-green-100' :
                    role === 'waiter' ? 'bg-blue-100' :
                    role === 'manager' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    {role === 'kitchen' ? <ChefHat className="w-5 h-5 text-orange-600" /> :
                     role === 'cashier' ? <CreditCard className="w-5 h-5 text-green-600" /> :
                     role === 'waiter' ? <Utensils className="w-5 h-5 text-blue-600" /> :
                     role === 'manager' ? <Users className="w-5 h-5 text-purple-600" /> :
                     <Users className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{role}</p>
                    <p className="text-sm text-gray-500">{info.active} aktif, {info.onBreak} istirahat</p>
                  </div>
                </div>
                <p className="text-xl font-bold">{info.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Shift Hari Ini</h3>
          <div className="space-y-4">
            {data?.employees?.shifts?.map((shift: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{shift.name}</p>
                  <p className="text-sm text-gray-500">{shift.start} - {shift.end}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">{shift.staff} staff</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    shift.status === 'active' ? 'bg-green-100 text-green-600' :
                    shift.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {shift.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4">Daftar Karyawan Aktif</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Check-in</th>
                <th className="text-left py-3 px-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {data?.employees?.staffList?.map((staff: any) => (
                <tr key={staff.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{staff.name}</td>
                  <td className="py-3 px-4">{staff.role}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      staff.status === 'active' ? 'bg-green-100 text-green-600' :
                      staff.status === 'break' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{staff.checkIn}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${staff.performance >= 90 ? 'bg-green-500' : staff.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${staff.performance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{staff.performance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSLATab = () => (
    <div className="space-y-6">
      {/* SLA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Kitchen SLA</h4>
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold">{data?.sla?.kitchenSLA?.compliance || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Target: {data?.sla?.kitchenSLA?.target || 0} min | Actual: {data?.sla?.kitchenSLA?.actual || 0} min
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${(data?.sla?.kitchenSLA?.compliance || 0) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${data?.sla?.kitchenSLA?.compliance || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Service SLA</h4>
            <Utensils className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{data?.sla?.serviceSLA?.compliance || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Target: {data?.sla?.serviceSLA?.target || 0} min | Actual: {data?.sla?.serviceSLA?.actual || 0} min
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${(data?.sla?.serviceSLA?.compliance || 0) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${data?.sla?.serviceSLA?.compliance || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Delivery SLA</h4>
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{data?.sla?.deliverySLA?.compliance || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Target: {data?.sla?.deliverySLA?.target || 0} min | Actual: {data?.sla?.deliverySLA?.actual || 0} min
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${(data?.sla?.deliverySLA?.compliance || 0) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${data?.sla?.deliverySLA?.compliance || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Overall SLA</h4>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold">{data?.sla?.overallSLA || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {data?.sla?.breaches?.length || 0} pelanggaran hari ini
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${(data?.sla?.overallSLA || 0) >= 90 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${data?.sla?.overallSLA || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* SLA Breaches */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Pelanggaran SLA Hari Ini
        </h3>
        {data?.sla?.breaches?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tipe</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Exceeded By</th>
                  <th className="text-left py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {data.sla.breaches.map((breach: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        breach.type === 'kitchen' ? 'bg-orange-100 text-orange-600' :
                        breach.type === 'service' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {breach.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{breach.orderNumber}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">+{breach.exceeded} min</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{breach.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p>Tidak ada pelanggaran SLA hari ini</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <HQLayout 
      title={branch?.name || 'Detail Cabang'} 
      subtitle="Monitoring real-time cabang"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/hq/branches')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Cabang
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Update: {lastRefresh.toLocaleTimeString('id-ID')}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchBranchData}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Branch Info Card */}
        {branch && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{branch.name}</h2>
                  <p className="text-gray-500">{branch.code} • {branch.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={branch.status || 'online'} />
                <button
                  onClick={() => router.push(`/hq/branches/settings?branch=${id}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'kitchen' && renderKitchenTab()}
                {activeTab === 'orders' && renderOrdersTab()}
                {activeTab === 'occupancy' && renderOccupancyTab()}
                {activeTab === 'employees' && renderEmployeesTab()}
                {activeTab === 'sla' && renderSLATab()}
              </>
            )}
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
