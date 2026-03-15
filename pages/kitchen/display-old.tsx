import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertCircle, Flame,
  ChefHat, Timer, Play, Pause, Check, X,
  Bell, Volume2, VolumeX, Maximize2, Minimize2
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
  prepTime: number;
  estimatedTime: number;
  customerName?: string;
}

const KitchenDisplaySystem: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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
        prepTime: 8,
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
        prepTime: 12,
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
        prepTime: 18,
        estimatedTime: 15,
        items: [
          { id: '7', name: 'Gado-gado', quantity: 1 }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (receivedAt: Date) => {
    const diff = Math.floor((currentTime.getTime() - receivedAt.getTime()) / 1000 / 60);
    return diff;
  };

  const handleStartOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'preparing' as const } : order
    ));
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'ready' as const } : order
    ));
  };

  const handleServeOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Baru';
      case 'preparing': return 'Dimasak';
      case 'ready': return 'Siap';
      default: return status;
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine-in': return '🍽️';
      case 'takeaway': return '🥡';
      case 'delivery': return '🛵';
      default: return '📦';
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

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <DashboardLayout>
      <Head>
        <title>Kitchen Display System | BEDAGANG</title>
      </Head>

      <div className="-m-6 min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChefHat className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Kitchen Display System</h1>
                <p className="text-sm text-sky-100">
                  {currentTime.toLocaleTimeString('id-ID')} • {orders.length} Pesanan Aktif
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
                onClick={() => setFullscreen(!fullscreen)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-200">Pesanan Baru</p>
                  <p className="text-3xl font-bold text-red-400">{newOrders.length}</p>
                </div>
                <Bell className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Sedang Dimasak</p>
                  <p className="text-3xl font-bold text-blue-400">{preparingOrders.length}</p>
                </div>
                <Flame className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-200">Siap Disajikan</p>
                  <p className="text-3xl font-bold text-green-400">{readyOrders.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="p-6">
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
                                  <p className="text-sm text-amber-400 mt-1">📝 {item.notes}</p>
                                )}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <p className="text-sm text-sky-400 mt-1">
                                    + {item.modifiers.join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {getElapsedTime(order.receivedAt)} menit lalu
                        </div>
                        <div className="text-sm text-gray-400">
                          Est. {order.estimatedTime} min
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartOrder(order.id)}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Mulai Masak
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
                {preparingOrders.map(order => (
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="bg-gray-700/50 rounded p-2">
                            <p className="font-medium text-white">
                              {item.quantity}x {item.name}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-amber-400 mt-1">📝 {item.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-blue-300">
                            <Timer className="w-4 h-4 mr-2" />
                            <span className="font-bold">{getElapsedTime(order.receivedAt)} menit</span>
                          </div>
                          <div className="text-sm text-blue-300">
                            Target: {order.estimatedTime} min
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Selesai
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Siap
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="bg-gray-700/50 rounded p-2">
                            <p className="font-medium text-white">
                              {item.quantity}x {item.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-green-500/20 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                          <span className="font-bold text-green-300">
                            Selesai dalam {order.prepTime} menit
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleServeOrder(order.id)}
                        variant="outline"
                        className="w-full border-green-500 text-green-400 hover:bg-green-500/20"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Sudah Disajikan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenDisplaySystem;
