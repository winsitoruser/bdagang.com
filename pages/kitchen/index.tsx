import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, Clock, CheckCircle, AlertCircle, 
  TrendingUp, Users, Package, BarChart3,
  ArrowRight, Flame, UtensilsCrossed, ClipboardList,
  Activity, RefreshCw, Wifi, WifiOff, ExternalLink
} from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface KitchenActivity {
  id: string;
  type: string;
  action: string;
  details: string;
  timeAgo: string;
  status: 'success' | 'processing' | 'warning' | 'info' | 'error';
}

const KitchenManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedToday: 0,
    avgPrepTime: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    uniqueCustomers: 0
  });
  const [activities, setActivities] = useState<KitchenActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // WebSocket for real-time updates
  const handleRealtimeUpdate = useCallback((message: any) => {
    if (message.event === 'kitchen:activity:new' || 
        message.event === 'kitchen:order:new' || 
        message.event === 'kitchen:order:update' ||
        message.event === 'kitchen:order:complete') {
      fetchActivities();
      fetchDashboardStats();
    }
  }, []);

  const { isConnected } = useWebSocket({
    branchId: session?.user?.branchId || 'default',
    role: 'kitchen',
    events: ['kitchen:activity:new', 'kitchen:order:new', 'kitchen:order:update', 'kitchen:order:complete'],
    onMessage: handleRealtimeUpdate
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardStats();
      fetchActivities();
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchDashboardStats();
        fetchActivities();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await fetch('/api/kitchen/activities?limit=10');
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/kitchen/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          activeOrders: result.data.stats.activeOrders,
          completedToday: result.data.stats.completedOrders,
          avgPrepTime: 18, // Calculate from API if needed
          pendingOrders: result.data.stats.activeOrders,
          totalRevenue: result.data.stats.totalRevenue,
          uniqueCustomers: result.data.stats.uniqueCustomers
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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

  const quickStats = [
    {
      label: 'Pesanan Aktif',
      value: stats.activeOrders,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Selesai Hari Ini',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Rata-rata Waktu',
      value: `${stats.avgPrepTime} min`,
      icon: Clock,
      color: 'from-blue-500 to-sky-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Menunggu',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const menuItems = [
    {
      title: 'Kitchen Display System',
      description: 'Monitor dan kelola pesanan real-time',
      href: '/kitchen/display',
      icon: UtensilsCrossed,
      color: 'from-sky-500 to-blue-600',
      stats: `${stats.activeOrders} aktif`
    },
    {
      title: 'Daftar Pesanan',
      description: 'Kelola semua pesanan dapur',
      href: '/kitchen/orders',
      icon: ClipboardList,
      color: 'from-purple-500 to-purple-600',
      stats: `${stats.pendingOrders} pending`
    },
    {
      title: 'Manajemen Resep',
      description: 'Kelola resep dan komposisi menu',
      href: '/kitchen/recipes',
      icon: ChefHat,
      color: 'from-green-500 to-emerald-600',
      stats: 'Lihat semua'
    },
    {
      title: 'Stok Bahan Dapur',
      description: 'Monitor stok bahan dan ingredient',
      href: '/kitchen/inventory',
      icon: Package,
      color: 'from-orange-500 to-red-600',
      stats: 'Cek stok'
    },
    {
      title: 'Analytics Dapur',
      description: 'Dashboard analitik performa dapur',
      href: '/kitchen/analytics',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      stats: 'Lihat insight'
    },
    {
      title: 'Laporan Dapur',
      description: 'Analisis performa dan efisiensi',
      href: '/kitchen/reports',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      stats: 'Lihat laporan'
    },
    {
      title: 'Tim Dapur',
      description: 'Kelola staff dan shift dapur',
      href: '/kitchen/staff',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      stats: 'Kelola tim'
    }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Management Kitchen | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <ChefHat className="w-10 h-10 mr-3" />
                <h1 className="text-3xl font-bold">Management Kitchen</h1>
              </div>
              <p className="text-sky-100">
                Sistem manajemen dapur terintegrasi untuk restoran & rumah makan
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-sm text-sky-100 mb-1">Status Dapur</div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xl font-bold">Operasional</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/kitchen/display">
                <Button className="h-20 w-full flex flex-col items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                  <UtensilsCrossed className="text-xl mb-1" />
                  <span className="text-sm">Buka KDS</span>
                </Button>
              </Link>
              <Link href="/kitchen/orders">
                <Button className="h-20 w-full flex flex-col items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <ClipboardList className="text-xl mb-1" />
                  <span className="text-sm">Lihat Pesanan</span>
                </Button>
              </Link>
              <Link href="/kitchen/recipes">
                <Button className="h-20 w-full flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <ChefHat className="text-xl mb-1" />
                  <span className="text-sm">Resep</span>
                </Button>
              </Link>
              <Link href="/kitchen/inventory">
                <Button className="h-20 w-full flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  <Package className="text-xl mb-1" />
                  <span className="text-sm">Stok Bahan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Modul Kitchen Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} href={item.href}>
                  <Card className="hover:shadow-xl transition-all cursor-pointer group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`bg-gradient-to-br ${item.color} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <ArrowRight className="text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {item.description}
                      </p>
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">{item.stats}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - GridView Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle>Aktivitas Terbaru</CardTitle>
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Wifi className="w-3 h-3 mr-1" /> Live
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                    <WifiOff className="w-3 h-3 mr-1" /> Offline
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={fetchActivities}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${activitiesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Link href="/kitchen/orders">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading && activities.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activities.slice(0, 8).map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                      activity.status === 'success' ? 'border-l-4 border-l-green-500 bg-green-50/30' :
                      activity.status === 'processing' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' :
                      activity.status === 'warning' ? 'border-l-4 border-l-amber-500 bg-amber-50/30' :
                      activity.status === 'error' ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                      'border-l-4 border-l-sky-500 bg-sky-50/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' :
                        activity.status === 'processing' ? 'bg-blue-100' :
                        activity.status === 'warning' ? 'bg-amber-100' :
                        activity.status === 'error' ? 'bg-red-100' :
                        'bg-sky-100'
                      }`}>
                        {activity.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         activity.status === 'processing' ? <Clock className="w-5 h-5 text-blue-600 animate-pulse" /> :
                         activity.status === 'warning' ? <AlertCircle className="w-5 h-5 text-amber-600" /> :
                         activity.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                         <Activity className="w-5 h-5 text-sky-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{activity.action}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">{activity.timeAgo}</p>
                          {activity.details && (
                            <span className="text-xs text-gray-400">• {activity.details}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      activity.status === 'success' ? 'bg-green-100 text-green-700' :
                      activity.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      activity.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                      activity.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-sky-100 text-sky-700'
                    }`}>
                      {activity.status === 'success' ? 'Selesai' :
                       activity.status === 'processing' ? 'Proses' :
                       activity.status === 'warning' ? 'Peringatan' :
                       activity.status === 'error' ? 'Error' :
                       'Info'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default function KitchenPageWithModuleGuard() {
  return (
    <ModuleGuard moduleCode="kitchen">
      <KitchenManagementPage />
    </ModuleGuard>
  );
}
