import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertCircle, Flame,
  ChefHat, Timer, Play, Pause, Check, X,
  Bell, Volume2, VolumeX, Maximize2, Minimize2,
  TrendingUp, TrendingDown, History, BarChart3
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'served';
  priority: 'normal' | 'urgent';
  receivedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  prepTime: number; // actual prep time in minutes
  estimatedTime: number; // estimated prep time in minutes
  customerName?: string;
}

interface CookingHistory {
  id: string;
  orderNumber: string;
  itemName: string;
  quantity: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  chefName?: string;
  actualTime: number; // in minutes
  estimatedTime: number; // in minutes
}

interface CookingStats {
  totalOrdersToday: number;
  averagePrepTime: number; // in minutes
  fastestOrder: number; // in minutes
  slowestOrder: number; // in minutes
  ordersPerHour: number;
  efficiencyRate: number; // percentage
}

const KitchenDisplaySystem: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [cookingHistory, setCookingHistory] = useState<CookingHistory[]>([]);
  const [stats, setStats] = useState<CookingStats>({
    totalOrdersToday: 0,
    averagePrepTime: 0,
    fastestOrder: 0,
    slowestOrder: 0,
    ordersPerHour: 0,
    efficiencyRate: 0
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // WebSocket connection for real-time updates
  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('[Kitchen] WebSocket message:', message);
    
    switch (message.event) {
      case 'kitchen:order:new':
        // Add new order to the list
        setOrders(prev => [message.data, ...prev]);
        // Play sound notification
        if (soundEnabled) {
          playNotificationSound();
        }
        break;
        
      case 'kitchen:order:update':
        // Update existing order
        setOrders(prev => prev.map(order => 
          order.id === message.data.id ? { ...order, ...message.data } : order
        ));
        break;
        
      case 'kitchen:order:complete':
        // Move order to history
        setOrders(prev => prev.filter(order => order.id !== message.data.id));
        break;
        
      case 'kitchen:order:cancel':
        // Remove cancelled order
        setOrders(prev => prev.filter(order => order.id !== message.data.id));
        break;
    }
  }, [soundEnabled]);

  const { isConnected, lastMessage } = useWebSocket({
    branchId: session?.user?.branchId || 'default',
    role: 'kitchen',
    events: ['kitchen:order:new', 'kitchen:order:update', 'kitchen:order:complete', 'kitchen:order:cancel'],
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('[Kitchen] WebSocket connected'),
    onDisconnect: () => console.log('[Kitchen] WebSocket disconnected')
  });

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => console.log('Audio play blocked'));
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with real API
  useEffect(() => {
    const mockOrders: KitchenOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        tableNumber: '5',
        orderType: 'dine-in',
        status: 'new',
        priority: 'urgent',
        receivedAt: new Date(Date.now() - 2 * 60000),
        prepTime: 0,
        estimatedTime: 15,
        items: [
          { id: '1', name: 'Nasi Goreng Spesial', quantity: 2, notes: 'Pedas level 3' },
          { id: '2', name: 'Ayam Bakar', quantity: 1, modifiers: ['Extra sambal'] }
        ]
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        tableNumber: '3',
        orderType: 'dine-in',
        status: 'preparing',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 8 * 60000),
        startedAt: new Date(Date.now() - 5 * 60000),
        prepTime: 5,
        estimatedTime: 20,
        items: [
          { id: '3', name: 'Soto Ayam', quantity: 2 },
          { id: '4', name: 'Es Teh Manis', quantity: 2 }
        ]
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        orderType: 'takeaway',
        status: 'preparing',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 12 * 60000),
        startedAt: new Date(Date.now() - 10 * 60000),
        prepTime: 10,
        estimatedTime: 25,
        customerName: 'Budi Santoso',
        items: [
          { id: '5', name: 'Mie Goreng', quantity: 3 },
          { id: '6', name: 'Tahu Tempe Goreng', quantity: 1 }
        ]
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        tableNumber: '7',
        orderType: 'dine-in',
        status: 'ready',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 18 * 60000),
        startedAt: new Date(Date.now() - 15 * 60000),
        completedAt: new Date(Date.now() - 2 * 60000),
        prepTime: 13,
        estimatedTime: 15,
        items: [
          { id: '7', name: 'Gado-Gado', quantity: 2 }
        ]
      }
    ];

    const mockHistory: CookingHistory[] = [
      {
        id: '1',
        orderNumber: 'ORD-005',
        itemName: 'Nasi Goreng Spesial',
        quantity: 2,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 2700000),
        duration: 900,
        chefName: 'Chef Joko',
        actualTime: 15,
        estimatedTime: 15
      },
      {
        id: '2',
        orderNumber: 'ORD-006',
        itemName: 'Ayam Bakar',
        quantity: 1,
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 5400000),
        duration: 1800,
        chefName: 'Chef Siti',
        actualTime: 30,
        estimatedTime: 25
      },
      {
        id: '3',
        orderNumber: 'ORD-007',
        itemName: 'Soto Ayam',
        quantity: 1,
        startTime: new Date(Date.now() - 5400000),
        endTime: new Date(Date.now() - 4800000),
        duration: 600,
        chefName: 'Chef Budi',
        actualTime: 10,
        estimatedTime: 12
      }
    ];

    const mockStats: CookingStats = {
      totalOrdersToday: 45,
      averagePrepTime: 18.5,
      fastestOrder: 8,
      slowestOrder: 35,
      ordersPerHour: 12,
      efficiencyRate: 85
    };

    setOrders(mockOrders);
    setCookingHistory(mockHistory);
    setStats(mockStats);
  }, []);

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const getOrderTypeIcon = (type: string) => {
    switch(type) {
      case 'dine-in': return '🍽️';
      case 'takeaway': return '🥡';
      case 'delivery': return '🛵';
      default: return '📋';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCountdown = (order: KitchenOrder) => {
    const now = currentTime.getTime();
    const start = order.startedAt ? order.startedAt.getTime() : order.receivedAt.getTime();
    const elapsed = (now - start) / 60000; // in minutes
    const remaining = Math.max(0, order.estimatedTime - elapsed);
    
    return {
      elapsed: Math.floor(elapsed),
      remaining: Math.ceil(remaining),
      isOverdue: remaining <= 0 && order.status === 'preparing'
    };
  };

  const getCountdownColor = (remaining: number, isOverdue: boolean) => {
    if (isOverdue) return 'text-red-500 animate-pulse';
    if (remaining <= 5) return 'text-orange-500';
    if (remaining <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status };
        if (status === 'preparing' && !order.startedAt) {
          updated.startedAt = new Date();
        }
        if (status === 'ready' && !order.completedAt) {
          updated.completedAt = new Date();
          updated.prepTime = Math.round((new Date().getTime() - order.startedAt!.getTime()) / 60000);
        }
        return updated;
      }
      return order;
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Kitchen Display System - Bedagang</title>
        <meta name="description" content="Kitchen Display System" />
      </Head>

      <div className={`min-h-screen bg-gray-900 text-white ${fullscreen ? 'p-0' : 'p-4'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <ChefHat className="w-8 h-8 mr-2" />
                Kitchen Display System
              </h1>
              <p className="text-sm text-sky-100">
                {currentTime.toLocaleString('id-ID')} • {orders.length} Pesanan Aktif
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <History className="w-4 h-4 mr-1" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 p-4 grid grid-cols-6 gap-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-200">Pesanan Baru</p>
                <p className="text-2xl font-bold text-red-400">{newOrders.length}</p>
              </div>
              <Bell className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Sedang Dimasak</p>
                <p className="text-2xl font-bold text-blue-400">{preparingOrders.length}</p>
              </div>
              <Flame className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-200">Siap Disajikan</p>
                <p className="text-2xl font-bold text-green-400">{readyOrders.length}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Rata-rata</p>
                <p className="text-2xl font-bold text-purple-400">{formatDuration(stats.averagePrepTime)}</p>
              </div>
              <Timer className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-200">Efisiensi</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.efficiencyRate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-200">Orders/Jam</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.ordersPerHour}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Orders Grid */}
          <div className={`flex-1 p-6 ${showHistory ? 'w-3/4' : ''}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* New Orders */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Pesanan Baru ({newOrders.length})
                </h2>
                <div className="space-y-4">
                  {newOrders.map(order => (
                    <Card key={order.id} className="bg-gray-800 border-red-500/50 border-2 shadow-lg shadow-red-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getOrderTypeIcon(order.orderType)}</span>
                            <div>
                              <CardTitle className="text-white text-lg">{order.orderNumber}</CardTitle>
                              <p className="text-sm text-gray-400">
                                {order.tableNumber ? `Meja ${order.tableNumber}` : order.customerName}
                              </p>
                            </div>
                          </div>
                          {order.priority === 'urgent' && (
                            <Badge className="bg-red-500 text-white">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Diterima: {formatTime(order.receivedAt)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-400">Estimasi:</span>
                          <span className="text-lg font-bold text-yellow-400">
                            {formatDuration(order.estimatedTime)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map(item => (
                            <div key={item.id} className="bg-gray-700/50 rounded p-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-white">
                                    {item.quantity}x {item.name}
                                  </p>
                                  {item.notes && (
                                    <p className="text-xs text-yellow-400 mt-1">Catatan: {item.notes}</p>
                                  )}
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Modifier: {item.modifiers.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Mulai Memasak
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Preparing Orders */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  Sedang Dimasak ({preparingOrders.length})
                </h2>
                <div className="space-y-4">
                  {preparingOrders.map(order => {
                    const countdown = getCountdown(order);
                    return (
                      <Card key={order.id} className="bg-gray-800 border-blue-500/50 border-2 shadow-lg shadow-blue-500/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{getOrderTypeIcon(order.orderType)}</span>
                              <div>
                                <CardTitle className="text-white text-lg">{order.orderNumber}</CardTitle>
                                <p className="text-sm text-gray-400">
                                  {order.tableNumber ? `Meja ${order.tableNumber}` : order.customerName}
                                </p>
                              </div>
                            </div>
                            {order.priority === 'urgent' && (
                              <Badge className="bg-red-500 text-white">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Dimulai: {order.startedAt ? formatTime(order.startedAt) : '-'}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-sm text-gray-400">Elapsed: </span>
                              <span className="text-sm font-bold text-white">{formatDuration(countdown.elapsed)}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">Sisa: </span>
                              <span className={`text-lg font-bold ${getCountdownColor(countdown.remaining, countdown.isOverdue)}`}>
                                {formatDuration(countdown.remaining)}
                              </span>
                            </div>
                          </div>
                          {countdown.isOverdue && (
                            <div className="text-xs text-red-400 mt-1 animate-pulse">
                              ⚠️ Melebihi estimasi waktu!
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {order.items.map(item => (
                              <div key={item.id} className="bg-gray-700/50 rounded p-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-white">
                                      {item.quantity}x {item.name}
                                    </p>
                                    {item.notes && (
                                      <p className="text-xs text-yellow-400 mt-1">Catatan: {item.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Selesai Dimasak
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Ready Orders */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Siap Disajikan ({readyOrders.length})
                </h2>
                <div className="space-y-4">
                  {readyOrders.map(order => (
                    <Card key={order.id} className="bg-gray-800 border-green-500/50 border-2 shadow-lg shadow-green-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getOrderTypeIcon(order.orderType)}</span>
                            <div>
                              <CardTitle className="text-white text-lg">{order.orderNumber}</CardTitle>
                              <p className="text-sm text-gray-400">
                                {order.tableNumber ? `Meja ${order.tableNumber}` : order.customerName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          <div>Selesai: {order.completedAt ? formatTime(order.completedAt) : '-'}</div>
                          <div>Waktu aktual: {formatDuration(order.prepTime)}</div>
                          <div>Estimasi: {formatDuration(order.estimatedTime)}</div>
                          <div className={`text-xs mt-1 ${order.prepTime <= order.estimatedTime ? 'text-green-400' : 'text-yellow-400'}`}>
                            {order.prepTime <= order.estimatedTime ? '✓ Tepat waktu' : `⚠ ${formatDuration(order.prepTime - order.estimatedTime)} terlambat`}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map(item => (
                            <div key={item.id} className="bg-gray-700/50 rounded p-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-white">
                                    {item.quantity}x {item.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => updateOrderStatus(order.id, 'served')}
                          className="w-full bg-gray-600 hover:bg-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Tandai Terlayani
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto max-h-screen">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                Riwayat Memasak
              </h2>
              
              {/* Stats Summary */}
              <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-semibold mb-2">Statistik Hari Ini</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Orders:</span>
                    <span className="font-medium">{stats.totalOrdersToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rata-rata:</span>
                    <span className="font-medium">{formatDuration(stats.averagePrepTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tercepat:</span>
                    <span className="font-medium text-green-400">{formatDuration(stats.fastestOrder)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Terlama:</span>
                    <span className="font-medium text-red-400">{formatDuration(stats.slowestOrder)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Efisiensi:</span>
                    <span className="font-medium">{stats.efficiencyRate}%</span>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-2">
                {cookingHistory.map(history => (
                  <div key={history.id} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{history.orderNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        history.actualTime <= history.estimatedTime 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {formatDuration(history.actualTime)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {history.quantity}x {history.itemName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {history.chefName} • {formatTime(history.endTime)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Estimasi: {formatDuration(history.estimatedTime)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenDisplaySystem;
