import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X, CreditCard, Banknote,
  QrCode, Receipt, ChevronDown, ChevronUp, User, Clock, Package,
  Tag, Check, ArrowLeft, History, Home, UserCircle, Wifi, WifiOff,
  ScanBarcode, AlertCircle, CheckCircle, Store, ChevronRight, Loader2,
  BarChart3, Settings, Users, MoreHorizontal, TrendingUp, TrendingDown,
  Phone, Mail, Star, Award, Printer, FileText, LogOut, Moon, Sun,
  RefreshCw, AlertOctagon, Boxes, ArrowUpDown, LayoutDashboard, Zap,
  DollarSign, ShoppingBag, UserCheck, Activity
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  category?: string;
}

interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  discount: number;
  points: number;
}

// ============================================================
// FORMAT HELPERS
// ============================================================
const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// ============================================================
// MAIN PAGE
// ============================================================
export default function MobilePOS() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Core state
  const [view, setView] = useState<'dashboard' | 'products' | 'cart' | 'history' | 'inventory' | 'customers' | 'reports' | 'more'>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);

  // Success
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Member
  const [showMember, setShowMember] = useState(false);
  const [membersList, setMembersList] = useState<MemberInfo[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [memberSearch, setMemberSearch] = useState('');

  // History
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Inventory
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [invSearch, setInvSearch] = useState('');
  const [invFilter, setInvFilter] = useState<'all' | 'low' | 'out'>('all');
  const [loadingInv, setLoadingInv] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', sku: '', barcode: '', sell_price: '', buy_price: '', unit: 'pcs', category_id: '', description: '', stock: '' });
  const [savingProduct, setSavingProduct] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTarget, setStockTarget] = useState<any>(null);
  const [stockAdjust, setStockAdjust] = useState({ quantity: '', type: 'set' as 'set' | 'add' | 'subtract' });
  const [savingStock, setSavingStock] = useState(false);

  // Customers
  const [customers, setCustomers] = useState<any[]>([]);
  const [custSearch, setCustSearch] = useState('');
  const [loadingCust, setLoadingCust] = useState(false);
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '' });

  // Reports
  const [reportData, setReportData] = useState<any>(null);
  const [reportType, setReportType] = useState<'sales-summary' | 'top-products' | 'category-sales'>('sales-summary');
  const [loadingReport, setLoadingReport] = useState(false);

  // Settings
  const [posSettings, setPosSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Dashboard
  const [dashData, setDashData] = useState<any>(null);
  const [loadingDash, setLoadingDash] = useState(false);

  // Online status
  const [isOnline, setIsOnline] = useState(true);

  // Shift
  const [activeShift, setActiveShift] = useState<any>(null);

  // Category scroll ref + drag-to-scroll
  const catRef = useRef<HTMLDivElement>(null);
  const catDrag = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onCatPointerDown = (e: React.PointerEvent) => {
    const el = catRef.current;
    if (!el) return;
    catDrag.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  };
  const onCatPointerMove = (e: React.PointerEvent) => {
    if (!catDrag.current.isDown || !catRef.current) return;
    const dx = e.clientX - catDrag.current.startX;
    if (Math.abs(dx) > 3) catDrag.current.moved = true;
    catRef.current.scrollLeft = catDrag.current.scrollLeft - dx;
  };
  const onCatPointerUp = (e: React.PointerEvent) => {
    if (!catRef.current) return;
    catDrag.current.isDown = false;
    catRef.current.style.cursor = 'grab';
  };

  // ============================================================
  // AUTH
  // ============================================================
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // ============================================================
  // ONLINE STATUS
  // ============================================================
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  // ============================================================
  // FETCH DASHBOARD
  // ============================================================
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const [salesRes, productsRes, membersRes] = await Promise.allSettled([
        fetch('/api/pos/reports?reportType=sales-summary&period=today').then(r => r.json()),
        fetch('/api/pos/products').then(r => r.json()),
        fetch('/api/pos/members').then(r => r.json()),
      ]);
      const sales = salesRes.status === 'fulfilled' && salesRes.value.success ? salesRes.value.data : null;
      const prods = productsRes.status === 'fulfilled' && productsRes.value.success ? productsRes.value.products : [];
      const members = membersRes.status === 'fulfilled' && membersRes.value.success ? membersRes.value.members : [];
      const lowStock = prods.filter((p: any) => p.stock > 0 && p.stock <= 10).length;
      const outStock = prods.filter((p: any) => p.stock <= 0).length;
      setDashData({
        totalSales: sales?.summary?.totalSales || 0,
        totalTrx: sales?.summary?.totalTransactions || 0,
        avgTrx: sales?.summary?.averageTransaction || 0,
        totalItems: sales?.summary?.totalItemsSold || 0,
        productCount: prods.length,
        memberCount: members.length,
        lowStock, outStock,
      });
    } catch (e) { console.error(e); }
    setLoadingDash(false);
  }, []);

  useEffect(() => {
    if (view === 'dashboard' && session) fetchDashboard();
  }, [view, session, fetchDashboard]);

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'Semua') params.append('category', selectedCategory);
      const res = await fetch(`/api/pos/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        if (data.categories) {
          const cats = data.categories.map((c: any) => typeof c === 'string' ? c : c.name);
          if (!cats.includes('Semua')) cats.unshift('Semua');
          setCategories(cats);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (session) fetchProducts();
  }, [session, fetchProducts]);

  // ============================================================
  // FETCH MEMBERS
  // ============================================================
  useEffect(() => {
    if (session) {
      fetch('/api/pos/members').then(r => r.json()).then(d => {
        if (d.success) setMembersList(d.members || []);
      }).catch(() => {});
    }
  }, [session]);

  // ============================================================
  // FETCH SHIFT STATUS
  // ============================================================
  useEffect(() => {
    if (session) {
      fetch('/api/pos/shifts/status').then(r => r.json()).then(d => {
        if (d.success && d.shift) setActiveShift(d.shift);
      }).catch(() => {});
    }
  }, [session]);

  // ============================================================
  // FETCH HISTORY
  // ============================================================
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/pos/transactions/list?limit=20');
      const data = await res.json();
      if (data.success) setTransactions(data.data || data.transactions || []);
    } catch (e) { console.error(e); }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    if (view === 'history' && session) fetchHistory();
  }, [view, session, fetchHistory]);

  // ============================================================
  // FETCH INVENTORY
  // ============================================================
  const fetchInventory = useCallback(async () => {
    setLoadingInv(true);
    try {
      const params = new URLSearchParams();
      if (invSearch) params.append('search', invSearch);
      const res = await fetch(`/api/pos/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) setInventoryProducts(data.products || []);
    } catch (e) { console.error(e); }
    setLoadingInv(false);
  }, [invSearch]);

  useEffect(() => {
    if (view === 'inventory' && session) fetchInventory();
  }, [view, session, fetchInventory]);

  const filteredInv = inventoryProducts.filter(p => {
    if (invFilter === 'low') return p.stock > 0 && p.stock <= (p.minimum_stock || 10);
    if (invFilter === 'out') return p.stock <= 0;
    return true;
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', sku: '', barcode: '', sell_price: '', buy_price: '', unit: 'pcs', category_id: '', description: '', stock: '' });
    setShowProductForm(true);
  };

  const openEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '', sku: p.sku || '', barcode: p.barcode || '',
      sell_price: String(p.price || ''), buy_price: '', unit: p.unit || 'pcs',
      category_id: String(p.categoryId || ''), description: p.description || '', stock: String(p.stock || 0)
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.sell_price) return alert('Nama dan harga jual wajib diisi');
    setSavingProduct(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body: any = { ...productForm, sell_price: productForm.sell_price, buy_price: productForm.buy_price || '0' };
      if (editingProduct) body.id = editingProduct.id;
      const res = await fetch('/api/pos/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setShowProductForm(false); fetchInventory(); fetchProducts(); }
      else alert(data.error || 'Gagal menyimpan produk');
    } catch (e) { alert('Terjadi kesalahan'); }
    setSavingProduct(false);
  };

  const openStockAdjust = (p: any) => {
    setStockTarget(p);
    setStockAdjust({ quantity: String(p.stock || 0), type: 'set' });
    setShowStockModal(true);
  };

  const handleStockAdjust = async () => {
    if (!stockTarget || stockAdjust.quantity === '') return;
    setSavingStock(true);
    try {
      const res = await fetch('/api/pos/products', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: stockTarget.id, quantity: stockAdjust.quantity, type: stockAdjust.type })
      });
      const data = await res.json();
      if (data.success) { setShowStockModal(false); fetchInventory(); fetchProducts(); }
      else alert(data.error || 'Gagal update stok');
    } catch (e) { alert('Terjadi kesalahan'); }
    setSavingStock(false);
  };

  // ============================================================
  // FETCH CUSTOMERS
  // ============================================================
  const fetchCustomers = useCallback(async () => {
    setLoadingCust(true);
    try {
      const params = new URLSearchParams();
      if (custSearch) params.append('search', custSearch);
      const res = await fetch(`/api/pos/members?${params.toString()}`);
      const data = await res.json();
      if (data.success) setCustomers(data.members || []);
    } catch (e) { console.error(e); }
    setLoadingCust(false);
  }, [custSearch]);

  useEffect(() => {
    if (view === 'customers' && session) fetchCustomers();
  }, [view, session, fetchCustomers]);

  const handleAddCustomer = async () => {
    if (!newCust.name || !newCust.phone) return alert('Nama dan telepon wajib diisi');
    try {
      const res = await fetch('/api/pos/members', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
      const data = await res.json();
      if (data.success) { setShowAddCust(false); setNewCust({ name: '', phone: '', email: '' }); fetchCustomers(); }
      else alert(data.error || 'Gagal menambah member');
    } catch (e) { alert('Terjadi kesalahan'); }
  };

  // ============================================================
  // FETCH REPORTS
  // ============================================================
  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/pos/reports?reportType=${reportType}&period=today`);
      const data = await res.json();
      if (data.success) setReportData(data.data);
    } catch (e) { console.error(e); }
    setLoadingReport(false);
  }, [reportType]);

  useEffect(() => {
    if (view === 'reports' && session) fetchReport();
  }, [view, session, fetchReport]);

  // ============================================================
  // FETCH SETTINGS
  // ============================================================
  useEffect(() => {
    if (view === 'more' && session && !posSettings) {
      setLoadingSettings(true);
      fetch('/api/pos/settings').then(r => r.json()).then(d => {
        if (d.success) setPosSettings(d.data);
      }).catch(() => {}).finally(() => setLoadingSettings(false));
    }
  }, [view, session, posSettings]);

  // ============================================================
  // CART LOGIC
  // ============================================================
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = selectedMember ? Math.round(subtotal * selectedMember.discount / 100) : 0;
  const total = subtotal - discount;

  const addToCart = (product: any) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock, category: product.category }]);
    }
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const nq = i.quantity + delta;
        if (nq <= 0) return i; // handled by remove
        if (nq > i.stock) return i;
        return { ...i, quantity: nq };
      }
      return i;
    }).filter(i => i.quantity > 0));
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedMember(null);
  };

  // ============================================================
  // PAYMENT
  // ============================================================
  const cashChange = (parseFloat(cashReceived) || 0) - total;

  const quickAmounts = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  const processPayment = async () => {
    if (paymentMethod === 'cash' && cashChange < 0) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/pos/cashier/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? cashReceived : String(total),
          customerType: selectedMember ? 'member' : 'walk-in',
          selectedMember,
          shiftId: activeShift?.id,
          cashierId: session?.user?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setReceiptData({
          transactionNumber: data.receipt?.transactionNumber || data.transactionNumber || `TRX-${Date.now()}`,
          date: new Date().toLocaleString('id-ID'),
          items: cart,
          subtotal, discount, total,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
          change: paymentMethod === 'cash' ? cashChange : 0,
          cashier: session?.user?.name || 'Kasir',
          member: selectedMember?.name || null,
        });
        setShowPayment(false);
        setShowSuccess(true);
        clearCart();
        setCashReceived('');
        fetchProducts();
      } else {
        alert(data.error || 'Pembayaran gagal');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan');
    }
    setProcessing(false);
  };

  // ============================================================
  // LOADING / AUTH GUARD
  // ============================================================
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <Head>
        <title>Mobile POS | BEDAGANG</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* ===== TOP BAR ===== */}
        <header className="bg-indigo-600 text-white px-4 pt-[env(safe-area-inset-top,8px)] pb-2 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 py-1">
            <Store className="w-5 h-5" />
            <div>
              <p className="text-sm font-bold leading-tight">BEDAGANG POS</p>
              <p className="text-[10px] text-indigo-200">{session?.user?.name || 'Kasir'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <WifiOff className="w-3 h-3" /> Offline
              </div>
            )}
            {activeShift ? (
              <div className="flex items-center gap-1 bg-green-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <Clock className="w-3 h-3" /> Shift Aktif
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium">
                <Clock className="w-3 h-3" /> No Shift
              </div>
            )}
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 overflow-hidden">

          {/* ---------- DASHBOARD VIEW ---------- */}
          {view === 'dashboard' && (
            <div className="flex flex-col h-[calc(100vh-108px)] overflow-y-auto pb-20">
              {/* Greeting */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 pt-4 pb-6 -mt-px">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-xs text-indigo-200">Selamat datang,</p>
                    <p className="text-base font-bold leading-tight">{session?.user?.name || 'Kasir'}</p>
                  </div>
                  <button onClick={fetchDashboard} className="ml-auto p-2 bg-white/10 rounded-lg active:bg-white/20">
                    <RefreshCw className={`w-4 h-4 text-white ${loadingDash ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Sales Card */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                  <p className="text-xs text-indigo-200 mb-1">Penjualan Hari Ini</p>
                  {loadingDash ? (
                    <div className="h-8 flex items-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>
                  ) : (
                    <p className="text-2xl font-extrabold text-white">{formatRp(dashData?.totalSales || 0)}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-[10px] text-indigo-200">Transaksi</p>
                      <p className="text-sm font-bold text-white">{dashData?.totalTrx || 0}</p>
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <div>
                      <p className="text-[10px] text-indigo-200">Rata-rata</p>
                      <p className="text-sm font-bold text-white">{formatRp(dashData?.avgTrx || 0)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/20" />
                    <div>
                      <p className="text-[10px] text-indigo-200">Item</p>
                      <p className="text-sm font-bold text-white">{dashData?.totalItems || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 -mt-3">
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: ShoppingBag, label: 'Kasir', color: 'bg-indigo-500', go: 'products' as const },
                      { icon: Boxes, label: 'Inventori', color: 'bg-emerald-500', go: 'inventory' as const },
                      { icon: Users, label: 'Pelanggan', color: 'bg-violet-500', go: 'customers' as const },
                      { icon: BarChart3, label: 'Laporan', color: 'bg-amber-500', go: 'reports' as const },
                    ].map(a => (
                      <button key={a.label} onClick={() => setView(a.go)}
                        className="flex flex-col items-center gap-1.5 py-2 rounded-xl active:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center`}>
                          <a.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-4 mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-400">Produk</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{dashData?.productCount || 0}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total terdaftar</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-xs text-gray-400">Member</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{dashData?.memberCount || 0}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Pelanggan aktif</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-xs text-gray-400">Stok Rendah</span>
                  </div>
                  <p className="text-xl font-bold text-yellow-600">{dashData?.lowStock || 0}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Perlu restock</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-xs text-gray-400">Stok Habis</span>
                  </div>
                  <p className="text-xl font-bold text-red-600">{dashData?.outStock || 0}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tidak tersedia</p>
                </div>
              </div>

              {/* Shift Status */}
              <div className="px-4 mt-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeShift ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Activity className={`w-5 h-5 ${activeShift ? 'text-green-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{activeShift ? 'Shift Sedang Berjalan' : 'Belum Ada Shift Aktif'}</p>
                      <p className="text-[10px] text-gray-400">
                        {activeShift
                          ? `Mulai ${new Date(activeShift.startTime || activeShift.start_time || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Mulai shift untuk mencatat transaksi'
                        }
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${activeShift ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
                  </div>
                </div>
              </div>

              {/* Quick Start Button */}
              <div className="px-4 mt-4 mb-4">
                <button onClick={() => setView('products')}
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform">
                  <Zap className="w-5 h-5" /> Mulai Transaksi Baru
                </button>
              </div>
            </div>
          )}

          {/* ---------- PRODUCTS VIEW ---------- */}
          {view === 'products' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              {/* Search */}
              <div className="px-3 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills - Carousel (hold + drag to scroll) */}
              <div
                ref={catRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-3 pb-2 select-none"
                style={{ WebkitOverflowScrolling: 'touch', cursor: 'grab' }}
                onPointerDown={onCatPointerDown}
                onPointerMove={onCatPointerMove}
                onPointerUp={onCatPointerUp}
                onPointerLeave={onCatPointerUp}
              >
                {categories.map((cat: any) => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const catKey = typeof cat === 'string' ? cat : cat.id;
                  const isActive = selectedCategory === catName;
                  return (
                    <button
                      key={catKey}
                      onClick={() => {
                        if (catDrag.current.moved) return;
                        setSelectedCategory(catName);
                        const btn = document.getElementById(`cat-${catKey}`);
                        if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                      }}
                      id={`cat-${catKey}`}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      {catName}
                    </button>
                  );
                })}
                <div className="flex-shrink-0 w-px" aria-hidden />
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto px-3 pb-24">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                    <p className="text-gray-400 text-sm">Memuat produk...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Package className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">Produk tidak ditemukan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {products.map(product => {
                      const inCart = cart.find(i => i.id === product.id);
                      return (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left active:scale-[0.97] transition-transform relative overflow-hidden"
                        >
                          {/* Product Image Placeholder */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center">
                            <Package className="w-8 h-8 text-indigo-300" />
                          </div>

                          {/* Cart badge */}
                          {inCart && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                              {inCart.quantity}
                            </div>
                          )}

                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm font-bold text-indigo-600">
                            {formatRp(product.price)}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{product.category}</span>
                            <span className={`text-[10px] font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                              Stok: {product.stock}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating Cart Button */}
              {cart.length > 0 && (
                <div className="fixed bottom-16 left-3 right-3 z-30">
                  <button
                    onClick={() => setView('cart')}
                    className="w-full bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-300/50 px-5 py-3.5 flex items-center justify-between active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
                          {cartCount}
                        </span>
                      </div>
                      <span className="font-semibold text-sm">Lihat Keranjang</span>
                    </div>
                    <span className="font-bold text-base">{formatRp(total)}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---------- CART VIEW ---------- */}
          {view === 'cart' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              {/* Cart Header */}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <button onClick={() => setView('products')} className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
                  <ArrowLeft className="w-4 h-4" /> Produk
                </button>
                <h2 className="font-bold text-gray-900">Keranjang ({cartCount})</h2>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-red-500 text-xs font-medium">Hapus Semua</button>
                )}
              </div>

              {/* Member Selection */}
              <div className="px-4 pb-2">
                <button
                  onClick={() => setShowMember(true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-sm ${
                    selectedMember
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    {selectedMember ? (
                      <div className="text-left">
                        <p className="font-semibold text-xs">{selectedMember.name}</p>
                        <p className="text-[10px] opacity-70">Diskon {selectedMember.discount}% · {selectedMember.points} poin</p>
                      </div>
                    ) : (
                      <span className="text-xs">Pilih Member (opsional)</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <ShoppingCart className="w-14 h-14 text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">Keranjang kosong</p>
                    <button onClick={() => setView('products')} className="mt-3 text-indigo-600 text-sm font-semibold">
                      + Tambah Produk
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 pr-2">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-gray-400">{formatRp(item.price)} / pcs</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 active:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-xl p-0.5">
                          <button
                            onClick={() => item.quantity > 1 ? updateQty(item.id, -1) : removeItem(item.id)}
                            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center active:bg-gray-100"
                          >
                            {item.quantity > 1 ? <Minus className="w-3.5 h-3.5 text-gray-600" /> : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center active:bg-gray-100 disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                        </div>
                        <p className="font-bold text-sm text-gray-900">{formatRp(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary + Pay Button */}
              {cart.length > 0 && (
                <div className="border-t bg-white px-4 pt-3 pb-3 space-y-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 68px)' }}>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal ({cartCount} item)</span>
                      <span>{formatRp(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon Member ({selectedMember?.discount}%)</span>
                        <span>-{formatRp(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-dashed">
                      <span>Total</span>
                      <span className="text-indigo-600">{formatRp(total)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPayment(true); setCashReceived(''); }}
                    className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-green-200/50 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Bayar {formatRp(total)}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---------- HISTORY VIEW ---------- */}
          {view === 'history' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              <div className="px-4 pt-3 pb-2">
                <h2 className="font-bold text-gray-900 text-base">Riwayat Transaksi</h2>
                <p className="text-xs text-gray-400">20 transaksi terakhir</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Receipt className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Belum ada transaksi</p>
                  </div>
                ) : (
                  transactions.map((trx: any) => (
                    <div key={trx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-indigo-600 font-medium">{trx.transaction_number || trx.transactionNumber || trx.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          trx.status === 'completed' ? 'bg-green-50 text-green-600' :
                          trx.status === 'voided' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                        }`}>{trx.status || 'completed'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(trx.created_at || trx.createdAt || trx.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-bold text-sm text-gray-900">{formatRp(trx.total || trx.grand_total || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded capitalize">{trx.payment_method || trx.paymentMethod || '-'}</span>
                        <span className="text-[10px] text-gray-400">{trx.total_items || trx.items?.length || '?'} item</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---------- INVENTORY VIEW ---------- */}
          {view === 'inventory' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-900 text-base">Inventori</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={fetchInventory} className="p-1.5 text-indigo-600"><RefreshCw className="w-4 h-4" /></button>
                    <button onClick={openAddProduct}
                      className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                      <Plus className="w-3.5 h-3.5" /> Produk
                    </button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Cari produk..." value={invSearch}
                    onChange={e => setInvSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'all' as const, label: 'Semua', count: inventoryProducts.length },
                    { id: 'low' as const, label: 'Stok Rendah', count: inventoryProducts.filter(p => p.stock > 0 && p.stock <= (p.minimum_stock || 10)).length },
                    { id: 'out' as const, label: 'Habis', count: inventoryProducts.filter(p => p.stock <= 0).length },
                  ].map(f => (
                    <button key={f.id} onClick={() => setInvFilter(f.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${invFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-20 space-y-2">
                {loadingInv ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
                ) : filteredInv.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Boxes className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Tidak ada produk</p>
                  </div>
                ) : filteredInv.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        p.stock <= 0 ? 'bg-red-50' : p.stock <= (p.minimum_stock || 10) ? 'bg-yellow-50' : 'bg-green-50'
                      }`}>
                        <Package className={`w-5 h-5 ${p.stock <= 0 ? 'text-red-400' : p.stock <= (p.minimum_stock || 10) ? 'text-yellow-500' : 'text-green-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.sku || p.barcode || '-'} · {p.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${p.stock <= 0 ? 'text-red-600' : p.stock <= (p.minimum_stock || 10) ? 'text-yellow-600' : 'text-gray-900'}`}>
                          {p.stock}
                        </p>
                        <p className="text-[10px] text-gray-400">{formatRp(p.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                      <button onClick={() => openEditProduct(p)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 py-1.5 rounded-lg active:bg-indigo-100">
                        <FileText className="w-3 h-3" /> Edit Produk
                      </button>
                      <button onClick={() => openStockAdjust(p)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-green-600 bg-green-50 py-1.5 rounded-lg active:bg-green-100">
                        <ArrowUpDown className="w-3 h-3" /> Atur Stok
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- CUSTOMERS VIEW ---------- */}
          {view === 'customers' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-900 text-base">Pelanggan</h2>
                  <button onClick={() => setShowAddCust(true)}
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Cari nama atau telepon..." value={custSearch}
                    onChange={e => setCustSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-20 space-y-2">
                {loadingCust ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
                ) : customers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Users className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Belum ada member</p>
                  </div>
                ) : customers.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Phone className="w-3 h-3" />{c.phone}</span>
                          {c.email && <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><Mail className="w-3 h-3" />{c.email}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-900">{c.points}</span>
                        </div>
                        <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                          {c.membershipLevel || 'Silver'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Diskon {c.discount}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- REPORTS VIEW ---------- */}
          {view === 'reports' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              <div className="px-3 pt-3 pb-2">
                <h2 className="font-bold text-gray-900 text-base mb-2">Laporan Penjualan</h2>
                <div className="flex gap-2">
                  {[
                    { id: 'sales-summary' as const, label: 'Ringkasan' },
                    { id: 'top-products' as const, label: 'Top Produk' },
                    { id: 'category-sales' as const, label: 'Kategori' },
                  ].map(r => (
                    <button key={r.id} onClick={() => setReportType(r.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${reportType === r.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-20">
                {loadingReport ? (
                  <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
                ) : !reportData ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <BarChart3 className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Data tidak tersedia</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {/* Sales Summary */}
                    {reportType === 'sales-summary' && reportData.summary && (
                      <>
                        <div className="bg-indigo-600 rounded-2xl p-4 text-white">
                          <p className="text-xs text-indigo-200 mb-1">Total Penjualan Hari Ini</p>
                          <p className="text-2xl font-extrabold">{formatRp(reportData.summary.totalSales || 0)}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div>
                              <p className="text-[10px] text-indigo-200">Transaksi</p>
                              <p className="text-sm font-bold">{reportData.summary.totalTransactions || 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-indigo-200">Rata-rata</p>
                              <p className="text-sm font-bold">{formatRp(reportData.summary.averageTransaction || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-indigo-200">Item</p>
                              <p className="text-sm font-bold">{reportData.summary.totalItemsSold || 0}</p>
                            </div>
                          </div>
                        </div>
                        {reportData.paymentBreakdown && (
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Metode Pembayaran</p>
                            {reportData.paymentBreakdown.map((pm: any, i: number) => (
                              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-700">{pm.paymentMethod}</span>
                                <div className="text-right">
                                  <span className="text-sm font-bold text-gray-900">{formatRp(pm.totalAmount)}</span>
                                  <span className="text-[10px] text-gray-400 ml-2">{pm.transactions} trx</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {reportData.timeBreakdown && (
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Per Waktu</p>
                            {reportData.timeBreakdown.map((tb: any, i: number) => (
                              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                <span className="text-xs text-gray-600">{tb.period}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-gray-400">{tb.transactions} trx</span>
                                  <span className="text-xs font-bold text-gray-900">{formatRp(tb.sales)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {/* Top Products */}
                    {reportType === 'top-products' && Array.isArray(reportData) && reportData.map((p: any, i: number) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-600">#{p.rank || i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{p.productName}</p>
                          <p className="text-[10px] text-gray-400">{p.categoryName} · {p.totalSold} terjual</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-gray-900">{formatRp(p.revenue)}</p>
                          <p className="text-[10px] text-green-600">+{formatRp(p.profit)}</p>
                        </div>
                      </div>
                    ))}
                    {/* Category Sales */}
                    {reportType === 'category-sales' && Array.isArray(reportData) && reportData.map((c: any, i: number) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-900">{c.categoryName}</p>
                          <span className="text-xs font-bold text-indigo-600">{c.percentage?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(c.percentage || 0, 100)}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{c.productCount} produk · {c.totalSold} terjual</span>
                          <span className="font-medium text-gray-700">{formatRp(c.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- MORE VIEW ---------- */}
          {view === 'more' && (
            <div className="flex flex-col h-[calc(100vh-108px)]">
              <div className="px-4 pt-3 pb-2">
                <h2 className="font-bold text-gray-900 text-base">Lainnya</h2>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
                {/* Profile Card */}
                <div className="bg-indigo-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <UserCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold">{session?.user?.name || 'Kasir'}</p>
                      <p className="text-xs text-indigo-200">{(session?.user as any)?.role || 'Cashier'}</p>
                    </div>
                  </div>
                  {activeShift && (
                    <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-300" />
                      <span className="text-xs">Shift aktif sejak {new Date(activeShift.startTime || activeShift.start_time || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Quick Menu */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => setView('history')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
                    <History className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-900 flex-1 text-left">Riwayat Transaksi</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                  <button onClick={() => setView('reports')} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 flex-1 text-left">Laporan Penjualan</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                {/* POS Settings */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pengaturan POS</p>
                  {loadingSettings ? (
                    <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-gray-300 animate-spin" /></div>
                  ) : posSettings ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <Printer className="w-5 h-5 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Printer</p>
                            <p className="text-[10px] text-gray-400">{posSettings.printer?.printerName || '-'} · {posSettings.printer?.printerType || 'thermal'} · {posSettings.printer?.connectionType || 'usb'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Struk</p>
                            <p className="text-[10px] text-gray-400">Lebar: {posSettings.receipt?.paperWidth || 80}mm · Logo: {posSettings.receipt?.showLogo ? 'Ya' : 'Tidak'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Store className="w-5 h-5 text-purple-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Info Toko</p>
                            <p className="text-[10px] text-gray-400">{posSettings.receipt?.storeAddress || '-'}</p>
                            <p className="text-[10px] text-gray-400">{posSettings.receipt?.storePhone || '-'} · {posSettings.receipt?.storeEmail || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">Pengaturan belum dimuat</div>
                  )}
                </div>

                {/* App Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Versi Aplikasi</span>
                    <span className="text-sm font-medium text-gray-900">1.0.0 Mobile</span>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <button onClick={() => router.push('/auth/login')}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-semibold active:bg-red-100">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ===== BOTTOM NAV ===== */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="flex items-center justify-around py-1.5">
            {[
              { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Beranda' },
              { id: 'products' as const, icon: ShoppingBag, label: 'Kasir' },
              { id: 'inventory' as const, icon: Boxes, label: 'Inventori' },
              { id: 'customers' as const, icon: Users, label: 'Pelanggan' },
              { id: 'more' as const, icon: MoreHorizontal, label: 'Lainnya' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all relative ${
                  view === tab.id ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ===== PAYMENT MODAL ===== */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPayment(false)}>
            <div
              className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pt-2 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Pembayaran</h2>
                <button onClick={() => setShowPayment(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Total */}
              <div className="mx-5 bg-indigo-50 rounded-xl p-4 text-center mb-4">
                <p className="text-xs text-indigo-500 font-medium mb-1">Total Pembayaran</p>
                <p className="text-3xl font-extrabold text-indigo-600">{formatRp(total)}</p>
                {discount > 0 && (
                  <p className="text-xs text-green-600 mt-1">Termasuk diskon member -{formatRp(discount)}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="px-5 mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Metode Pembayaran</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash' ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span className="text-xs font-semibold">Tunai</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'qris' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span className="text-xs font-semibold">QRIS</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card' ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-400'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-semibold">Kartu</span>
                  </button>
                </div>
              </div>

              {/* Cash Input */}
              {paymentMethod === 'cash' && (
                <div className="px-5 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Uang Diterima</p>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="w-full text-center text-2xl font-bold py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
                    autoFocus
                  />
                  {/* Quick amounts */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {quickAmounts.map(amt => (
                      <button
                        key={amt}
                        onClick={() => setCashReceived(String(amt))}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          String(amt) === cashReceived
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {formatRp(amt)}
                      </button>
                    ))}
                  </div>
                  {cashReceived && cashChange >= 0 && (
                    <div className="mt-3 bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-600">Kembalian</p>
                      <p className="text-xl font-bold text-green-600">{formatRp(cashChange)}</p>
                    </div>
                  )}
                  {cashReceived && cashChange < 0 && (
                    <div className="mt-3 bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-red-600">Kurang</p>
                      <p className="text-xl font-bold text-red-600">{formatRp(Math.abs(cashChange))}</p>
                    </div>
                  )}
                </div>
              )}

              {/* QRIS Placeholder */}
              {paymentMethod === 'qris' && (
                <div className="px-5 mb-4">
                  <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center">
                    <QrCode className="w-20 h-20 text-blue-400 mb-3" />
                    <p className="text-sm text-blue-600 font-medium">Scan QR untuk membayar</p>
                    <p className="text-xs text-blue-400 mt-1">Tunjukkan QR code ke pelanggan</p>
                  </div>
                </div>
              )}

              {/* Card Placeholder */}
              {paymentMethod === 'card' && (
                <div className="px-5 mb-4">
                  <div className="bg-purple-50 rounded-xl p-6 flex flex-col items-center">
                    <CreditCard className="w-16 h-16 text-purple-400 mb-3" />
                    <p className="text-sm text-purple-600 font-medium">Proses via mesin EDC</p>
                    <p className="text-xs text-purple-400 mt-1">Tap / Insert / Swipe kartu pelanggan</p>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <div className="px-5 pb-4">
                <button
                  onClick={processPayment}
                  disabled={processing || (paymentMethod === 'cash' && cashChange < 0)}
                  className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200/50 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                  ) : (
                    <><Check className="w-5 h-5" /> Konfirmasi Pembayaran</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== SUCCESS MODAL ===== */}
        {showSuccess && receiptData && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
              {/* Success Header */}
              <div className="bg-green-500 px-5 py-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
                <p className="text-green-100 text-sm mt-1">{receiptData.transactionNumber}</p>
              </div>

              {/* Receipt Detail */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tanggal</span>
                  <span className="font-medium text-gray-900">{receiptData.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kasir</span>
                  <span className="font-medium text-gray-900">{receiptData.cashier}</span>
                </div>
                {receiptData.member && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member</span>
                    <span className="font-medium text-gray-900">{receiptData.member}</span>
                  </div>
                )}

                <div className="border-t border-dashed pt-2 space-y-1">
                  {receiptData.items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatRp(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatRp(receiptData.subtotal)}</span>
                  </div>
                  {receiptData.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span>-{formatRp(receiptData.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatRp(receiptData.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Bayar ({receiptData.paymentMethod})</span>
                    <span>{formatRp(receiptData.cashReceived)}</span>
                  </div>
                  {receiptData.change > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Kembalian</span>
                      <span>{formatRp(receiptData.change)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 space-y-2">
                <button
                  onClick={() => { setShowSuccess(false); setView('products'); }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
                >
                  Transaksi Baru
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MEMBER MODAL ===== */}
        {showMember && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowMember(false)}>
            <div
              className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold text-gray-900">Pilih Member</h2>
                <button onClick={() => setShowMember(false)} className="p-1.5">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="px-5 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau telepon..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Walk-in option */}
              <div className="px-5 pb-2">
                <button
                  onClick={() => { setSelectedMember(null); setShowMember(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600 active:bg-gray-100"
                >
                  🚶 Walk-in Customer (tanpa member)
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
                {membersList
                  .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch))
                  .map(member => (
                    <button
                      key={member.id}
                      onClick={() => { setSelectedMember(member); setShowMember(false); }}
                      className={`w-full text-left px-3 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                        selectedMember?.id === member.id
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-purple-600">Diskon {member.discount}%</p>
                          <p className="text-[10px] text-gray-400">{member.points} poin</p>
                        </div>
                      </div>
                    </button>
                  ))
                }
                {membersList.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch)).length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Member tidak ditemukan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== ADD CUSTOMER MODAL ===== */}
        {showAddCust && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAddCust(false)}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl" onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold text-gray-900">Tambah Member</h2>
                <button onClick={() => setShowAddCust(false)} className="p-1.5"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nama *</label>
                  <input type="text" value={newCust.name} onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                    placeholder="Nama lengkap" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">No. Telepon *</label>
                  <input type="tel" inputMode="tel" value={newCust.phone} onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Email (opsional)</label>
                  <input type="email" inputMode="email" value={newCust.email} onChange={e => setNewCust({ ...newCust, email: e.target.value })}
                    placeholder="email@contoh.com" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="px-5 pb-4">
                <button onClick={handleAddCustomer}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform">
                  Simpan Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRODUCT FORM MODAL (Add/Edit) ===== */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowProductForm(false)}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()} style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
              <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
                <button onClick={() => setShowProductForm(false)} className="p-1.5"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Produk *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Nama produk" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">SKU</label>
                    <input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="Auto-generate" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Barcode</label>
                    <input type="text" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })}
                      placeholder="Opsional" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Harga Jual *</label>
                    <input type="number" inputMode="numeric" value={productForm.sell_price}
                      onChange={e => setProductForm({ ...productForm, sell_price: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Harga Beli</label>
                    <input type="number" inputMode="numeric" value={productForm.buy_price}
                      onChange={e => setProductForm({ ...productForm, buy_price: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Satuan</label>
                    <select value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="liter">Liter</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                      <option value="lusin">Lusin</option>
                      <option value="meter">Meter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kategori</label>
                    <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      <option value="">-- Pilih --</option>
                      {categories.filter(c => c !== 'Semua').map((c: any) => (
                        <option key={typeof c === 'string' ? c : c.id} value={typeof c === 'string' ? '' : c.id}>
                          {typeof c === 'string' ? c : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {!editingProduct && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Stok Awal</label>
                    <input type="number" inputMode="numeric" value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Deskripsi</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Opsional" rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none" />
                </div>
              </div>
              <div className="px-5 pb-4">
                <button onClick={handleSaveProduct} disabled={savingProduct}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingProduct ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Check className="w-4 h-4" /> {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== STOCK ADJUSTMENT MODAL ===== */}
        {showStockModal && stockTarget && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowStockModal(false)}>
            <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl"
              onClick={e => e.stopPropagation()} style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
              <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b">
                <h2 className="text-lg font-bold text-gray-900">Atur Stok</h2>
                <button onClick={() => setShowStockModal(false)} className="p-1.5"><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="px-5 py-4">
                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-sm font-semibold text-gray-900">{stockTarget.name}</p>
                  <p className="text-xs text-gray-400">{stockTarget.sku || '-'} · {stockTarget.category}</p>
                  <p className="text-xs mt-1">Stok saat ini: <span className="font-bold text-indigo-600">{stockTarget.stock}</span></p>
                </div>

                {/* Adjustment Type */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Tipe Penyesuaian</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'set' as const, label: 'Set Stok', desc: 'Tetapkan nilai' },
                      { id: 'add' as const, label: 'Tambah', desc: 'Stok masuk' },
                      { id: 'subtract' as const, label: 'Kurang', desc: 'Stok keluar' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setStockAdjust({ ...stockAdjust, type: t.id })}
                        className={`py-2 px-2 rounded-xl text-center transition-all ${
                          stockAdjust.type === t.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                        <p className="text-xs font-semibold">{t.label}</p>
                        <p className="text-[9px] opacity-70">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {stockAdjust.type === 'set' ? 'Stok Baru' : stockAdjust.type === 'add' ? 'Jumlah Tambah' : 'Jumlah Kurang'}
                  </label>
                  <input type="number" inputMode="numeric" value={stockAdjust.quantity}
                    onChange={e => setStockAdjust({ ...stockAdjust, quantity: e.target.value })}
                    className="w-full text-center text-2xl font-bold py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    autoFocus />
                  {stockAdjust.type !== 'set' && stockAdjust.quantity && (
                    <p className="text-xs text-center mt-2 text-gray-500">
                      Stok setelah: <span className="font-bold text-indigo-600">
                        {stockAdjust.type === 'add'
                          ? (stockTarget.stock + parseInt(stockAdjust.quantity || '0'))
                          : Math.max(0, stockTarget.stock - parseInt(stockAdjust.quantity || '0'))
                        }
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className="px-5 pb-4">
                <button onClick={handleStockAdjust} disabled={savingStock}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingStock ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Check className="w-4 h-4" /> Simpan Stok</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global styles for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </>
  );
}
