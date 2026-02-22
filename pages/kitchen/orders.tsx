import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Clock, CheckCircle, AlertCircle, X,
  ChefHat, Calendar, Download, Eye, MoreVertical, Bike,
  Phone, MapPin, CreditCard, User, Truck, DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryInfo {
  platform: {
    id: string;
    name: string;
    color: string;
    logo: string;
    orderId: string;
  };
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
    rating: string;
  };
  payment: {
    method: string;
    status: 'paid' | 'pending';
    paidAt: string | null;
    platformFee: number;
    deliveryFee: number;
    promoDiscount: number;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
    notes: string | null;
  };
  estimatedArrival: string;
  distance: string;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customerName?: string;
  items: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'normal' | 'urgent' | 'high';
  receivedAt: Date;
  completedAt?: Date;
  prepTime?: number;
  totalAmount: number;
  subtotal?: number;
  delivery_info?: DeliveryInfo;
  payment?: {
    method: string;
    status: 'paid' | 'pending';
    paidAt: string | null;
  };
}

// Platform badge colors
const platformColors: Record<string, { bg: string; text: string }> = {
  gofood: { bg: 'bg-green-100', text: 'text-green-700' },
  grabfood: { bg: 'bg-green-100', text: 'text-green-700' },
  shopeefood: { bg: 'bg-orange-100', text: 'text-orange-700' }
};

// Payment method icons
const paymentIcons: Record<string, string> = {
  'GoPay': '💚',
  'GoPay Later': '💳',
  'OVO': '💜',
  'GrabPay': '💚',
  'ShopeePay': '🧡',
  'SPayLater': '💳',
  'Cash': '💵',
  'QRIS': '📱',
  'Debit Card': '💳',
  'LinkAja': '🔴'
};

const KitchenOrdersPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        orderType: typeFilter,
        search: searchQuery,
        limit: '100'
      });

      const response = await fetch(`/api/kitchen/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto refresh every 5 seconds
    return () => clearInterval(interval);
  }, [statusFilter, typeFilter, searchQuery]);

  const filteredOrders = orders.filter((order: any) => {
    // Handle both camelCase and snake_case from API
    const orderNumber = order.orderNumber || order.order_number || '';
    const tableNumber = order.tableNumber || order.table_number || '';
    const customerName = order.customerName || order.customer_name || '';
    const orderType = order.orderType || order.order_type || '';
    
    const matchesSearch = !searchQuery || 
                         orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tableNumber.includes(searchQuery) ||
                         customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || orderType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-red-100 text-red-800 border-red-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      new: 'Baru',
      preparing: 'Dimasak',
      ready: 'Siap',
      served: 'Disajikan',
      cancelled: 'Dibatalkan'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getOrderTypeLabel = (type: string) => {
    const labels = {
      'dine-in': 'Dine In',
      'takeaway': 'Take Away',
      'delivery': 'Delivery'
    };
    return labels[type as keyof typeof labels];
  };

  const formatTime = (date: Date | string | undefined | null) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Daftar Pesanan Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan Dapur</h1>
              <p className="text-gray-600">Kelola semua pesanan masuk ke dapur</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              Hari Ini
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pesanan Baru</p>
                  <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sedang Dimasak</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Siap Disajikan</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nomor order, meja, atau nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="preparing">Dimasak</SelectItem>
                  <SelectItem value="ready">Siap</SelectItem>
                  <SelectItem value="served">Disajikan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="dine-in">Dine In</SelectItem>
                  <SelectItem value="takeaway">Take Away</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Order</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pelanggan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipe/Platform</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pembayaran</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => {
                    // Handle both camelCase and snake_case from API
                    const orderNumber = order.orderNumber || order.order_number || '-';
                    const tableNumber = order.tableNumber || order.table_number;
                    const customerName = order.customerName || order.customer_name || '-';
                    const orderType = order.orderType || order.order_type || '';
                    const receivedAt = order.receivedAt || order.received_at;
                    const totalAmount = order.totalAmount || order.total_amount || 0;
                    const itemCount = Array.isArray(order.items) ? order.items.length : (order.items || 0);
                    const deliveryInfo = order.delivery_info;
                    const payment = order.payment;
                    
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {order.priority === 'urgent' || order.priority === 'high' ? (
                              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                            ) : null}
                            <div>
                              <span className="font-medium text-gray-900">{orderNumber}</span>
                              {deliveryInfo && (
                                <div className="text-xs text-gray-500">{deliveryInfo.platform.orderId}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="text-gray-900 font-medium">
                              {tableNumber ? `Meja ${tableNumber}` : deliveryInfo?.customer?.name || customerName}
                            </span>
                            {deliveryInfo?.customer?.phone && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {deliveryInfo.customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {deliveryInfo ? (
                              <Badge className={`${platformColors[deliveryInfo.platform.id]?.bg || 'bg-gray-100'} ${platformColors[deliveryInfo.platform.id]?.text || 'text-gray-700'} border-0`}>
                                <Bike className="w-3 h-3 mr-1" />
                                {deliveryInfo.platform.name}
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-600">{getOrderTypeLabel(orderType) || orderType}</span>
                            )}
                            {deliveryInfo && (
                              <div className="text-xs text-gray-500">{deliveryInfo.distance}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{itemCount} item</span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{paymentIcons[payment?.method] || '💳'}</span>
                              <span className="text-sm font-medium">{payment?.method || '-'}</span>
                            </div>
                            <Badge className={payment?.status === 'paid' ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                              {payment?.status === 'paid' ? '✓ Lunas' : '⏳ Belum Bayar'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const order = selectedOrder;
                const orderNumber = order.orderNumber || order.order_number || '-';
                const orderType = order.orderType || order.order_type || '';
                const deliveryInfo = order.delivery_info;
                const payment = order.payment;
                const totalAmount = order.totalAmount || order.total_amount || 0;
                const subtotal = order.subtotal || totalAmount;
                const items = order.items || [];

                return (
                  <>
                    {/* Header */}
                    <div className={`p-5 rounded-t-2xl text-white ${deliveryInfo ? (
                      deliveryInfo.platform.id === 'gofood' ? 'bg-green-600' :
                      deliveryInfo.platform.id === 'grabfood' ? 'bg-green-700' :
                      'bg-orange-500'
                    ) : 'bg-sky-600'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            {deliveryInfo ? <Bike className="w-8 h-8" /> : <ChefHat className="w-8 h-8" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">{orderNumber}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            {deliveryInfo && (
                              <p className="text-sm opacity-80">{deliveryInfo.platform.name} • {deliveryInfo.platform.orderId}</p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-5">
                      {/* Delivery Info */}
                      {deliveryInfo && (
                        <>
                          {/* Platform & Driver Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Bike className="w-4 h-4" /> Info Driver
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Nama:</span>
                                  <span className="font-medium">{deliveryInfo.driver.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Telepon:</span>
                                  <span className="font-medium">{deliveryInfo.driver.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Kendaraan:</span>
                                  <span className="font-medium">{deliveryInfo.driver.vehicle}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Plat Nomor:</span>
                                  <span className="font-medium">{deliveryInfo.driver.plateNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Rating:</span>
                                  <span className="font-medium">⭐ {deliveryInfo.driver.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Info Pengiriman
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Jarak:</span>
                                  <span className="font-medium">{deliveryInfo.distance}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Est. Tiba:</span>
                                  <span className="font-medium">{formatTime(deliveryInfo.estimatedArrival)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Alamat:</span>
                                  <p className="font-medium mt-1">{deliveryInfo.customer.address}</p>
                                </div>
                                {deliveryInfo.customer.notes && (
                                  <div>
                                    <span className="text-gray-500">Catatan:</span>
                                    <p className="font-medium mt-1 text-orange-600">📝 {deliveryInfo.customer.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" /> Info Pelanggan
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{deliveryInfo.customer.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{deliveryInfo.customer.phone}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Payment Info */}
                      <div className={`rounded-xl p-4 ${payment?.status === 'paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <h4 className={`font-semibold mb-3 flex items-center gap-2 ${payment?.status === 'paid' ? 'text-green-900' : 'text-amber-900'}`}>
                          <CreditCard className="w-4 h-4" /> Status Pembayaran
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Metode:</span>
                              <span className="font-bold flex items-center gap-1">
                                {paymentIcons[payment?.method] || '💳'} {payment?.method || '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <Badge className={payment?.status === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                                {payment?.status === 'paid' ? '✓ LUNAS' : '⏳ BELUM BAYAR'}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {deliveryInfo && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Platform Fee:</span>
                                  <span className="font-medium">{formatCurrency(deliveryInfo.payment.platformFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Ongkir:</span>
                                  <span className="font-medium">{formatCurrency(deliveryInfo.payment.deliveryFee)}</span>
                                </div>
                                {deliveryInfo.payment.promoDiscount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Diskon:</span>
                                    <span className="font-medium">-{formatCurrency(deliveryInfo.payment.promoDiscount)}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Detail Pesanan ({Array.isArray(items) ? items.length : 0} item)</h4>
                        <div className="space-y-2">
                          {Array.isArray(items) && items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-orange-600">{item.quantity}x</span>
                                  <span className="font-medium">{item.name}</span>
                                </div>
                                {item.notes && <p className="text-xs text-gray-500 mt-1">📝 {item.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {deliveryInfo && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Ongkir</span>
                              <span>{formatCurrency(deliveryInfo.payment.deliveryFee)}</span>
                            </div>
                            {deliveryInfo.payment.promoDiscount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Diskon</span>
                                <span>-{formatCurrency(deliveryInfo.payment.promoDiscount)}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                          Tutup
                        </Button>
                        {order.status === 'new' && (
                          <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                            <ChefHat className="w-4 h-4 mr-2" /> Mulai Masak
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button className="flex-1 bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" /> Siap Diambil
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KitchenOrdersPage;
