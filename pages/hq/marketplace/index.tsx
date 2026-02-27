import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import {
  ShoppingBag, Package, ShoppingCart, Store, Settings,
  CheckCircle, Circle, ArrowRight, RefreshCw, TrendingUp,
  BarChart3, AlertCircle, Link2, Unlink
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  icon: string;
  status: string;
  productsSync: number;
  ordersToday: number;
  color: string;
}

interface MPData {
  channels: Channel[];
  stats: { totalChannels: number; connectedChannels: number; totalProductsSynced: number; totalOrdersToday: number; totalRevenue: number; pendingOrders: number };
  setupSteps: { step: number; title: string; completed: boolean }[];
}

function MarketplaceDashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MPData | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hq/marketplace');
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch { /* fallback */ } finally { setLoading(false); }
  };

  if (!mounted) return null;

  return (
    <HQLayout title="Marketplace Integration" subtitle="Hubungkan toko online Anda di berbagai marketplace">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Channel Terhubung', value: `${data?.stats.connectedChannels || 0}/${data?.stats.totalChannels || 0}`, icon: Link2, color: 'text-blue-600 bg-blue-100' },
            { label: 'Produk Tersync', value: data?.stats.totalProductsSynced || 0, icon: Package, color: 'text-green-600 bg-green-100' },
            { label: 'Order Hari Ini', value: data?.stats.totalOrdersToday || 0, icon: ShoppingCart, color: 'text-purple-600 bg-purple-100' },
            { label: 'Pending Order', value: data?.stats.pendingOrders || 0, icon: AlertCircle, color: 'text-amber-600 bg-amber-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Marketplace Channels */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-500" /> Channel Marketplace
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.channels.map((ch) => (
              <div key={ch.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
                  style={{ backgroundColor: ch.color }}
                >
                  {ch.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{ch.name}</h4>
                  <p className="text-xs text-gray-500">
                    {ch.status === 'connected'
                      ? `${ch.productsSync} produk tersync · ${ch.ordersToday} order hari ini`
                      : 'Belum terhubung'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    ch.status === 'connected'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {ch.status === 'connected' ? 'Terhubung' : 'Tidak Aktif'}
                  </span>
                  <button className={`px-4 py-2 text-sm rounded-lg font-medium ${
                    ch.status === 'connected'
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {ch.status === 'connected' ? 'Kelola' : 'Hubungkan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Steps */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> Langkah Setup
            </h3>
            <div className="space-y-3">
              {data?.setupSteps.map((step) => (
                <div key={step.step} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {step.completed
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  }
                  <span className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {step.step}. {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Fitur Marketplace Integration</h3>
            <div className="space-y-3">
              {[
                { title: 'Auto-Sync Produk & Harga', desc: 'Perubahan di Bedagang otomatis update ke semua marketplace' },
                { title: 'Auto-Sync Order', desc: 'Order dari marketplace langsung masuk ke sistem POS' },
                { title: 'Auto-Update Stok', desc: 'Stok terjual otomatis dikurangi di semua channel' },
                { title: 'Laporan Konsolidasi', desc: 'Lihat performa penjualan semua marketplace dalam 1 dashboard' },
                { title: 'Multi-Toko', desc: 'Kelola beberapa toko di marketplace yang sama' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-orange-100">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HQLayout>
  );
}

export default function MarketplaceDashboard() {
  return (
    <ModuleGuard moduleCode="marketplace_integration">
      <MarketplaceDashboardContent />
    </ModuleGuard>
  );
}
