import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { 
  ChefHat, UtensilsCrossed, Clock, Users, DollarSign,
  TrendingUp, AlertCircle, CheckCircle, Flame, Package,
  Calendar, MapPin, Bell, ArrowRight, RefreshCw, Eye, ShoppingBag, Bike
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from 'react-hot-toast';
import OnlineOrderPanel from "@/components/orders/OnlineOrderPanel";

const FnBDashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) {
      fetchFnBData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchFnBData, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchFnBData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel with better error handling
      const [ordersRes, tablesRes, reservationsRes, statsRes] = await Promise.all([
        fetch('/api/kitchen/orders?status=pending&limit=10').catch(e => ({ ok: false, error: 'Orders API failed', url: '/api/kitchen/orders' })),
        fetch('/api/tables/status').catch(e => ({ ok: false, error: 'Tables API failed', url: '/api/tables/status' })),
        fetch('/api/reservations/today').catch(e => ({ ok: false, error: 'Reservations API failed', url: '/api/reservations/today' })),
        fetch('/api/dashboard/fnb-stats').catch(e => ({ ok: false, error: 'Stats API failed', url: '/api/dashboard/fnb-stats' }))
      ]);

      // Check each response individually
      let hasError = false;
      const errors: string[] = [];

      if (!ordersRes.ok) {
        hasError = true;
        errors.push(`Orders API: ${(ordersRes as any).error || `HTTP ${ordersRes.status}`}`);
        console.error('Orders API failed:', ordersRes);
      }

      if (!tablesRes.ok) {
        hasError = true;
        errors.push(`Tables API: ${(tablesRes as any).error || `HTTP ${tablesRes.status}`}`);
        console.error('Tables API failed:', tablesRes);
      }

      if (!reservationsRes.ok) {
        hasError = true;
        errors.push(`Reservations API: ${(reservationsRes as any).error || `HTTP ${reservationsRes.status}`}`);
        console.error('Reservations API failed:', reservationsRes);
      }

      if (!statsRes.ok) {
        hasError = true;
        errors.push(`Stats API: ${(statsRes as any).error || `HTTP ${statsRes.status}`}`);
        console.error('Stats API failed:', statsRes);
      }

      // Parse responses only if they're OK
      let ordersData = { success: false, data: [] };
      let tablesData = { success: false, data: [] };
      let reservationsData = { success: false, data: [] };
      let statsData = { success: false, data: null };

      try {
        if (ordersRes.ok) {
          const text = await ordersRes.text();
          // Check if response is HTML (error page)
          if (text.startsWith('<!DOCTYPE')) {
            console.error('Orders API returned HTML instead of JSON');
            ordersData = { success: false, data: [] };
          } else {
            ordersData = JSON.parse(text);
          }
        }
      } catch (e) {
        console.error('Failed to parse orders data:', e);
        ordersData = { success: false, data: [] };
      }

      try {
        if (tablesRes.ok) {
          const text = await tablesRes.text();
          if (text.startsWith('<!DOCTYPE')) {
            console.error('Tables API returned HTML instead of JSON');
            tablesData = { success: false, data: [] };
          } else {
            tablesData = JSON.parse(text);
          }
        }
      } catch (e) {
        console.error('Failed to parse tables data:', e);
        tablesData = { success: false, data: [] };
      }

      try {
        if (reservationsRes.ok) {
          const text = await reservationsRes.text();
          if (text.startsWith('<!DOCTYPE')) {
            console.error('Reservations API returned HTML instead of JSON');
            reservationsData = { success: false, data: [] };
          } else {
            reservationsData = JSON.parse(text);
          }
        }
      } catch (e) {
        console.error('Failed to parse reservations data:', e);
        reservationsData = { success: false, data: [] };
      }

      try {
        if (statsRes.ok) {
          const text = await statsRes.text();
          if (text.startsWith('<!DOCTYPE')) {
            console.error('Stats API returned HTML instead of JSON');
            statsData = { success: false, data: null };
          } else {
            statsData = JSON.parse(text);
          }
        }
      } catch (e) {
        console.error('Failed to parse stats data:', e);
        statsData = { success: false, data: null };
      }

      // Set data even if some APIs failed
      if (ordersData.success) {
        setKitchenOrders(ordersData.data || []);
      } else {
        setKitchenOrders([]);
      }

      if (tablesData.success) {
        setTables(tablesData.data || []);
      } else {
        setTables([]);
      }

      if (reservationsData.success) {
        setReservations(reservationsData.data || []);
      } else {
        setReservations([]);
      }

      if (statsData.success) {
        setStats(statsData.data);
      } else {
        setStats({
          activeOrders: 0,
          tablesOccupied: 0,
          tablesTotal: 0,
          todayReservations: 0,
          avgPrepTime: 0,
          todaySales: 0,
          completedOrders: 0,
          salesChange: 0,
          totalGuests: 0,
          lowStockItems: 0
        });
      }

      // Show error message if any API failed
      if (hasError) {
        console.error('API Errors:', errors);
        toast.error(`Beberapa data gagal dimuat: ${errors.join(', ')}`);
      }

    } catch (error) {
      console.error('Error fetching F&B data:', error);
      toast.error('Gagal memuat data dashboard');
      
      // Set empty defaults on error
      setKitchenOrders([]);
      setTables([]);
      setReservations([]);
      setStats({
        activeOrders: 0,
        tablesOccupied: 0,
        tablesTotal: 0,
        todayReservations: 0,
        avgPrepTime: 0,
        todaySales: 0,
        completedOrders: 0,
        salesChange: 0,
        totalGuests: 0,
        lowStockItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-orange-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat dashboard F&B...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard F&B | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* F&B Header - Restaurant Style */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <ChefHat className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">
                    Dashboard Restoran
                  </h1>
                  <p className="text-orange-100 text-lg">
                    Operasional Dapur & Pelayanan Real-time
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold mb-1">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-orange-100">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-6 h-6" />
                  <span className="text-2xl font-bold">{stats?.activeOrders || 0}</span>
                </div>
                <p className="text-sm text-orange-100">Pesanan Aktif</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <UtensilsCrossed className="w-6 h-6" />
                  <span className="text-2xl font-bold">{stats?.tablesOccupied || 0}/{stats?.tablesTotal || 0}</span>
                </div>
                <p className="text-sm text-orange-100">Meja Terisi</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-2xl font-bold">{stats?.todayReservations || 0}</span>
                </div>
                <p className="text-sm text-orange-100">Reservasi Hari Ini</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-2xl font-bold">{stats?.avgPrepTime || 0}m</span>
                </div>
                <p className="text-sm text-orange-100">Avg. Prep Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid - F&B Specific */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">Penjualan Hari Ini</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.todaySales || 0)}</p>
              <p className={`text-xs mt-1 ${(stats?.salesChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.salesChange || 0) >= 0 ? '+' : ''}{stats?.salesChange || 0}% dari kemarin
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">Pesanan Selesai</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Target: 50 pesanan</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Tamu</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalGuests || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Hari ini</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">Stok Rendah</h3>
              <p className="text-3xl font-bold text-gray-900">{stats?.lowStockItems || 0}</p>
              <p className="text-xs text-orange-600 mt-1">Perlu restock</p>
            </CardContent>
          </Card>
        </div>

        {/* Kitchen Operations - Real-time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Kitchen Orders */}
          <Card className="lg:col-span-2 border-2 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pesanan Dapur Aktif</CardTitle>
                    <CardDescription>Real-time kitchen operations</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={fetchFnBData}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <Link href="/kitchen/display">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Eye className="w-4 h-4 mr-2" />
                      Buka KDS
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {kitchenOrders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Tidak ada pesanan aktif</p>
                  <p className="text-sm text-gray-400">Semua pesanan sudah selesai</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kitchenOrders.slice(0, 6).map((order: any) => (
                    <div key={order.id} className={`border-2 rounded-lg p-4 transition-all ${
                      order.status === 'new' ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            order.status === 'new' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            <UtensilsCrossed className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{order.order_number}</p>
                            <p className="text-xs text-gray-500">
                              {order.table_number ? `Meja ${order.table_number}` : 'Takeaway'}
                            </p>
                          </div>
                        </div>
                        <Badge className={order.status === 'new' ? 'bg-red-500' : 'bg-blue-500'}>
                          {order.status === 'new' ? 'BARU' : 'DIMASAK'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items?.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="text-sm flex items-center">
                            <span className="font-semibold mr-2">{item.quantity}x</span>
                            <span className="text-gray-700">{item.name}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} item lagi</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {order.estimated_time || 15} menit
                        </div>
                        {order.priority === 'urgent' && (
                          <Badge className="bg-red-600">URGENT</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Status Overview */}
          <Card className="border-2 border-teal-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Status Meja</CardTitle>
                    <CardDescription>Live table status</CardDescription>
                  </div>
                </div>
                <Link href="/tables">
                  <Button variant="outline" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 ${
                      table.status === 'occupied' 
                        ? 'bg-red-50 border-red-300 hover:border-red-400' 
                        : table.status === 'reserved'
                        ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
                        : 'bg-green-50 border-green-300 hover:border-green-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      table.status === 'occupied' 
                        ? 'bg-red-500' 
                        : table.status === 'reserved'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}>
                      <span className="text-white font-bold text-sm">{table.number}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">
                      {table.status === 'occupied' 
                        ? `${table.guests}/${table.capacity}` 
                        : table.status === 'reserved'
                        ? 'Reserved'
                        : 'Available'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Occupied</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Reserved</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Online Orders & Queue Management */}
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Bike className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Pesanan Online & Antrian</CardTitle>
                  <CardDescription>GoFood, GrabFood, ShopeeFood & Walk-in</CardDescription>
                </div>
              </div>
              <Link href="/orders/queue">
                <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Kelola Antrian
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <OnlineOrderPanel />
          </CardContent>
        </Card>

        {/* Reservations Today */}
        <Card className="border-2 border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Reservasi Hari Ini</CardTitle>
                  <CardDescription>Upcoming reservations</CardDescription>
                </div>
              </div>
              <Link href="/reservations">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Kelola Reservasi
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Tidak ada reservasi hari ini</p>
                  <p className="text-sm text-gray-400">Reservasi akan muncul di sini</p>
                </div>
              ) : (
                reservations.map((reservation: any) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{reservation.name}</p>
                        <p className="text-sm text-gray-600">{reservation.guests} orang • {reservation.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {reservation.table && (
                        <Badge variant="outline" className="border-teal-500 text-teal-700">
                          Meja {reservation.table}
                        </Badge>
                      )}
                      <Badge className={reservation.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}>
                        {reservation.status === 'confirmed' ? 'Confirmed' : reservation.status === 'pending' ? 'Pending' : reservation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - F&B Specific */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/kitchen/display">
            <div className="group bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl p-6 text-white transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <UtensilsCrossed className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Kitchen Display</h3>
              <p className="text-sm text-orange-100">Monitor pesanan real-time</p>
            </div>
          </Link>

          <Link href="/kitchen/orders">
            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl p-6 text-white transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <Bell className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Daftar Pesanan</h3>
              <p className="text-sm text-purple-100">Kelola semua pesanan</p>
            </div>
          </Link>

          <Link href="/tables">
            <div className="group bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl p-6 text-white transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <MapPin className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Manajemen Meja</h3>
              <p className="text-sm text-teal-100">Status & pengaturan meja</p>
            </div>
          </Link>

          <Link href="/reservations">
            <div className="group bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl p-6 text-white transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
              <Calendar className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Reservasi</h3>
              <p className="text-sm text-indigo-100">Booking & jadwal tamu</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FnBDashboard;
