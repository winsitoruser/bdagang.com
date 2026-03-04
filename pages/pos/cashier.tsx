import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AddCustomerWizard from '@/components/customers/AddCustomerWizard';
import { 
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaBarcode, 
  FaSearch, FaCreditCard, FaMoneyBillWave, FaReceipt,
  FaTimes, FaCheck, FaCashRegister, FaBox, FaTag, FaQrcode,
  FaChartBar, FaUsers, FaClock, FaList, FaPause
} from 'react-icons/fa';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

const CashierPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  // Customer & Discount states
  const [customerType, setCustomerType] = useState<'walk-in' | 'member'>('walk-in');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', discount: 10 });
  const [membersList, setMembersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<(string | { id: number; name: string })[]>(['Semua']);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  
  // Shift Management states
  const [activeShift, setActiveShift] = useState<any>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftAction, setShiftAction] = useState<'open' | 'close'>('open');
  
  // Payment success states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  // Held Transactions states
  const [heldTransactions, setHeldTransactions] = useState<any[]>([]);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showHeldListModal, setShowHeldListModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdCustomerName, setHoldCustomerName] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Fetch products from API
  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session, searchQuery, selectedCategory]);

  // Fetch members from API
  useEffect(() => {
    if (session) {
      fetchMembers();
    }
  }, [session]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'Semua') params.append('category', selectedCategory);

      const response = await fetch(`/api/pos/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        if (data.categories) {
          setCategories(data.categories);
        }
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/pos/members');
      const data = await response.json();

      if (data.success) {
        setMembersList(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Add new member via API
  const handleAddMemberAPI = async () => {
    if (!newMember.name || !newMember.phone) {
      alert('Nama dan nomor telepon harus diisi!');
      return;
    }

    try {
      const response = await fetch('/api/pos/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });

      const data = await response.json();

      if (data.success) {
        setSelectedMember(data.member);
        setCustomerType('member');
        setNewMember({ name: '', phone: '', discount: 10 });
        setShowAddMemberForm(false);
        setShowMemberModal(false);
        alert('Member baru berhasil ditambahkan!');
        fetchMembers(); // Refresh members list
      } else {
        alert(data.error || 'Gagal menambahkan member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Terjadi kesalahan saat menambahkan member');
    }
  };

  // Filter members based on search
  const filteredMembers = membersList.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.phone.includes(searchMember)
  );

  // Keep old function for backward compatibility
  const handleAddMember = () => {
    handleAddMemberAPI();
  };

  // Mock vouchers
  const vouchers = [
    { id: '1', code: 'DISKON10', name: 'Diskon 10%', type: 'percentage', value: 10, minPurchase: 50000 },
    { id: '2', code: 'DISKON20', name: 'Diskon 20%', type: 'percentage', value: 20, minPurchase: 100000 },
    { id: '3', code: 'POTONGAN50K', name: 'Potongan Rp 50.000', type: 'fixed', value: 50000, minPurchase: 200000 },
    { id: '4', code: 'GRATIS10K', name: 'Gratis Ongkir Rp 10.000', type: 'fixed', value: 10000, minPurchase: 0 },
  ];

  // Products are now fetched from API via useEffect

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    // Member discount
    if (customerType === 'member' && selectedMember) {
      discount += (subtotal * selectedMember.discount) / 100;
    }

    // Voucher discount
    if (selectedVoucher) {
      if (subtotal >= selectedVoucher.minPurchase) {
        if (selectedVoucher.type === 'percentage') {
          discount += (subtotal * selectedVoucher.value) / 100;
        } else {
          discount += selectedVoucher.value;
        }
      }
    }

    return discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateChange = () => {
    const cash = parseFloat(cashReceived) || 0;
    const total = calculateTotal();
    return cash - total;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (paymentMethod === 'cash') {
      const change = calculateChange();
      if (change < 0) {
        alert('Uang yang diterima kurang!');
        return;
      }
    }

    setIsProcessingCheckout(true);

    try {
      const response = await fetch('/api/pos/cashier/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          paymentMethod,
          cashReceived,
          customerType,
          selectedMember,
          selectedVoucher,
          shiftId: activeShift?.id,
          cashierId: session?.user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        // Increment transaction counter
        setTransactionCount(transactionCount + 1);
        
        // Update shift stats if shift is active
        if (activeShift) {
          const total = calculateTotal();
          setActiveShift({
            ...activeShift,
            totalTransactions: (activeShift.totalTransactions || 0) + 1,
            totalSales: (activeShift.totalSales || 0) + total,
            cashSales: paymentMethod === 'cash' ? (activeShift.cashSales || 0) + total : activeShift.cashSales || 0,
            cardSales: paymentMethod === 'card' ? (activeShift.cardSales || 0) + total : activeShift.cardSales || 0,
            ewalletSales: paymentMethod === 'qris' ? (activeShift.ewalletSales || 0) + total : activeShift.ewalletSales || 0
          });
        }
        
        alert(`Pembayaran berhasil!\nNo. Transaksi: ${data.receipt.transactionNumber}`);
        setShowPaymentModal(false);
        clearCart();
        setCashReceived('');
        setSelectedMember(null);
        setSelectedVoucher(null);
        setCustomerType('walk-in');
        
        // Refresh products to update stock
        fetchProducts();
      } else {
        alert(data.error || 'Pembayaran gagal!');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessingCheckout(false);
    }
    
    // Generate receipt data
    const receipt = {
      id: `TRX-${Date.now()}`,
      date: new Date().toLocaleString('id-ID'),
      cashier: session?.user?.name || 'Kasir',
      items: cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      paymentMethod: paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : calculateTotal(),
      change: paymentMethod === 'cash' ? calculateChange() : 0,
      customerType: customerType,
      customerName: customerType === 'member' ? selectedMember?.name : 'Walk-in Customer'
    };
    
    setReceiptData(receipt);
    setShowPaymentModal(false);
    setShowSuccessModal(true);
    clearCart();
    setCashReceived('');
  };

  // Held Transactions Functions
  const fetchHeldTransactions = async () => {
    try {
      const response = await fetch('/api/pos/transactions/held');
      const data = await response.json();
      
      if (data.success) {
        setHeldTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching held transactions:', error);
    }
  };

  const handleHoldTransaction = async () => {
    if (cart.length === 0) {
      alert('Cart kosong! Tambahkan item terlebih dahulu.');
      return;
    }

    try {
      const response = await fetch('/api/pos/transactions/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          subtotal: calculateSubtotal(),
          discount: calculateDiscount(),
          tax: 0,
          total: calculateTotal(),
          customerType,
          customerName: holdCustomerName || (selectedMember?.name || ''),
          customerId: selectedMember?.id || null,
          selectedMember,
          selectedVoucher,
          holdReason,
          notes: ''
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cart and states
        clearCart();
        setHoldCustomerName('');
        setHoldReason('');
        setShowHoldModal(false);
        setSelectedMember(null);
        setSelectedVoucher(null);
        setCustomerType('walk-in');
        
        // Refresh held transactions
        fetchHeldTransactions();
        
        alert(`Transaksi berhasil ditahan!\nNo: ${data.data.holdNumber}`);
      } else {
        alert(data.error || 'Gagal menahan transaksi');
      }
    } catch (error) {
      console.error('Error holding transaction:', error);
      alert('Terjadi kesalahan saat menahan transaksi');
    }
  };

  const handleResumeTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/pos/transactions/held/${id}/resume`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Restore cart from held transaction
        setCart(data.data.cartItems);
        setCustomerType(data.data.customerType);
        setSelectedMember(data.data.selectedMember);
        setSelectedVoucher(data.data.selectedVoucher);
        
        // Close modal
        setShowHeldListModal(false);
        
        // Refresh held transactions
        fetchHeldTransactions();
        
        alert('Transaksi berhasil dilanjutkan!');
      } else {
        alert(data.error || 'Gagal melanjutkan transaksi');
      }
    } catch (error) {
      console.error('Error resuming transaction:', error);
      alert('Terjadi kesalahan saat melanjutkan transaksi');
    }
  };

  const handleCancelHeld = async (id: string) => {
    if (!confirm('Yakin ingin membatalkan transaksi yang ditahan?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pos/transactions/held/${id}/cancel`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchHeldTransactions();
        alert('Transaksi dibatalkan');
      } else {
        alert(data.error || 'Gagal membatalkan transaksi');
      }
    } catch (error) {
      console.error('Error cancelling held transaction:', error);
      alert('Terjadi kesalahan saat membatalkan transaksi');
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat kasir...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const total = calculateTotal();

  return (
    <DashboardLayout>
      <Head>
        <title>Kasir | BEDAGANG Cloud POS</title>
      </Head>

      {/* Professional Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <FaCashRegister className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Kasir</h1>
              <p className="text-white/80 text-sm">Sistem Kasir Profesional</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Kasir</p>
            <p className="text-white font-semibold">{session?.user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Professional Search Bar */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-indigo-100 p-5">
            <div className="relative mb-4">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Cari produk atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-14 py-4 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-base font-medium placeholder:text-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-indigo-100 p-2 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all">
                <FaBarcode className="text-indigo-600 w-5 h-5" />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FaTag className="text-indigo-500 w-4 h-4 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={typeof category === 'string' ? category : category.id}
                  onClick={() => setSelectedCategory(typeof category === 'string' ? category : category.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === (typeof category === 'string' ? category : category.name)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200'
                  }`}
                >
                  {typeof category === 'string' ? category : category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Professional Products Grid */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-indigo-100 p-5 overflow-y-auto" style={{ height: 'calc(100vh - 320px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                  <FaBox className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Katalog Produk</h2>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredProducts.length} items
              </span>
            </div>
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Memuat produk...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FaBox className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-semibold text-gray-500">Tidak ada produk ditemukan</p>
                <p className="text-sm mt-1">Coba ubah kata kunci atau filter kategori</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
                  >
                    <div className="aspect-square bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-300"></div>
                      <FaBox className="w-8 h-8 text-indigo-600 relative z-10 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xs text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <div>
                        <p className="text-indigo-600 font-bold text-sm">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${product.stock > 20 ? 'bg-green-500' : product.stock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                          Stok: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Cart Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-2 border-indigo-200 p-4 flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 rounded-lg">
                  <FaShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Keranjang Belanja</h2>
                  <p className="text-xs text-gray-500">{cart.length} item dipilih</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Shift Button - Moved from Floating Bar */}
                {activeShift ? (
                  <button
                    onClick={() => {
                      setShiftAction('close');
                      setShowShiftModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-green-100 border border-green-300 px-2.5 py-1.5 rounded-lg"
                  >
                    <FaClock className="w-3.5 h-3.5 text-green-600" />
                    <div className="text-left">
                      <p className="text-[10px] font-semibold text-green-700 leading-tight">Shift Aktif</p>
                      <p className="text-[10px] text-green-600 leading-tight">{activeShift.shiftType || 'Pagi'}</p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShiftAction('open');
                      setShowShiftModal(true);
                    }}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <FaClock className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-semibold text-xs">Buka Shift</span>
                  </button>
                )}
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer Type Selection */}
            <div className="mb-2.5 bg-white rounded-xl p-2.5 border-2 border-indigo-100">
              <label className="text-xs font-bold text-gray-700 mb-2 block">Jenis Pelanggan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCustomerType('walk-in');
                    setSelectedMember(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customerType === 'walk-in'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🚶 Walk-in
                </button>
                <button
                  onClick={() => {
                    setCustomerType('member');
                    setShowMemberModal(true);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customerType === 'member'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👤 Member
                </button>
              </div>
              {customerType === 'member' && selectedMember && (
                <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-900">{selectedMember.name}</p>
                      <p className="text-xs text-purple-600">{selectedMember.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600">Diskon {selectedMember.discount}%</p>
                      <p className="text-xs text-purple-500">{selectedMember.points} poin</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Keranjang Masih Kosong</p>
                  <p className="text-gray-400 text-sm mt-1">Pilih produk untuk memulai transaksi</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-md border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg transition-all ml-2"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 bg-indigo-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-all"
                        >
                          <FaMinus className="w-2.5 h-2.5 text-indigo-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-indigo-600">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-all"
                        >
                          <FaPlus className="w-2.5 h-2.5 text-indigo-600" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-indigo-600">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Professional Total Section - Fixed at Bottom */}
            <div className="mt-4 border-t-2 border-indigo-200 pt-4 space-y-2">
              {/* Voucher Selection - Moved before Subtotal */}
              <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Voucher / Kupon</label>
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Pilih
                  </button>
                </div>
                {selectedVoucher ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-orange-900">{selectedVoucher.code}</p>
                        <p className="text-xs text-orange-600">{selectedVoucher.name}</p>
                      </div>
                      <button
                        onClick={() => setSelectedVoucher(null)}
                        className="ml-2 text-orange-600 hover:text-orange-700"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1.5 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">Tidak ada voucher dipilih</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-2.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Subtotal</span>
                  <span className="font-semibold text-gray-900 text-sm">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <FaTag className="w-3 h-3" />
                      Diskon
                    </span>
                    <span className="font-semibold text-green-600 text-sm">- Rp {calculateDiscount().toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Pajak (0%)</span>
                  <span className="font-semibold text-gray-900 text-sm">Rp 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl border-t-2 border-white/20 backdrop-blur-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Quick Shortcuts - Moved to Left */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/pos/transactions')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <FaShoppingCart className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Transaksi</span>
              </button>
              
              <button
                onClick={() => router.push('/inventory')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <FaBox className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Stok</span>
              </button>
              
              <button
                onClick={() => router.push('/pos/reports')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <FaChartBar className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Laporan</span>
              </button>
              
              <button
                onClick={() => router.push('/customers')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <FaUsers className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Pelanggan</span>
              </button>
              
              {/* Tahan Button */}
              <button
                onClick={() => {
                  if (cart.length > 0) {
                    setPendingTransactions([...pendingTransactions, { id: Date.now(), cart: [...cart], total: calculateTotal(), time: new Date() }]);
                    clearCart();
                    alert('Transaksi ditahan!');
                  }
                }}
                disabled={cart.length === 0}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <FaClock className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Tahan</span>
              </button>
              
              {/* Pending Transactions */}
              <button
                onClick={() => setShowPendingModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
              >
                <div className="relative">
                  <FaReceipt className="w-4 h-4 text-white" />
                  {pendingTransactions.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse text-[10px]">
                      {pendingTransactions.length}
                    </span>
                  )}
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">Transaksi Gantung</span>
              </button>
            </div>

            {/* Bayar Sekarang Button - Moved from Cart with Total */}
            <div className="flex items-center gap-2">
              {/* Hold Transaction Button */}
              <button
                onClick={() => setShowHoldModal(true)}
                disabled={cart.length === 0}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-all shadow-lg"
              >
                <FaPause className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden lg:block">Tahan</span>
              </button>

              {/* Held Transactions Button */}
              <button
                onClick={() => {
                  setShowHeldListModal(true);
                  fetchHeldTransactions();
                }}
                className="relative flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all shadow-lg"
              >
                <FaList className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden lg:block">Ditahan</span>
                {heldTransactions.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {heldTransactions.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2 rounded-lg transition-all shadow-lg whitespace-nowrap min-w-[200px]"
              >
                <FaCreditCard className="w-4 h-4 text-white" />
                <div className="flex flex-col items-start">
                  <span className="text-white text-xs font-medium">Bayar Sekarang</span>
                  <span className="text-white text-base font-bold leading-tight">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </button>
              
              {activeShift && (
                <button
                  onClick={() => {
                    setShiftAction('close');
                    setShowShiftModal(true);
                  }}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-xl transition-all shadow-lg"
                >
                  <FaClock className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-xs hidden lg:block">
                    Tutup Shift
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Pilih Member</h2>
              </div>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSearchMember('');
                  setShowAddMemberForm(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor telepon..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all text-sm"
                />
              </div>
            </div>

            {/* Add Member Button - Now opens Wizard */}
            <button
              onClick={() => setShowAddMemberForm(true)}
              className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Tambah Member Baru
            </button>

            {/* Members List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaUsers className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Member tidak ditemukan</p>
                  <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain atau tambah member baru</p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setCustomerType('member');
                      setShowMemberModal(false);
                      setSearchMember('');
                      setShowAddMemberForm(false);
                    }}
                    className="w-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all text-left hover:border-purple-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">Diskon {member.discount}%</p>
                        <p className="text-xs text-purple-500">{member.points} poin</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <FaTag className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Pilih Voucher</h2>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vouchers.map((voucher) => {
                const subtotal = calculateSubtotal();
                const isEligible = subtotal >= voucher.minPurchase;
                
                return (
                  <button
                    key={voucher.id}
                    onClick={() => {
                      if (isEligible) {
                        setSelectedVoucher(voucher);
                        setShowVoucherModal(false);
                      }
                    }}
                    disabled={!isEligible}
                    className={`w-full rounded-xl p-4 text-left transition-all ${
                      isEligible
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-lg hover:border-yellow-400'
                        : 'bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{voucher.code}</p>
                        <p className="text-sm text-gray-600">{voucher.name}</p>
                      </div>
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {voucher.type === 'percentage' ? `${voucher.value}%` : `Rp ${(voucher.value / 1000).toFixed(0)}K`}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isEligible ? 'text-gray-600' : 'text-red-600 font-semibold'}>
                        Min. pembelian: Rp {voucher.minPurchase.toLocaleString('id-ID')}
                      </span>
                      {!isEligible && (
                        <span className="text-red-600 font-semibold">
                          Kurang Rp {(voucher.minPurchase - subtotal).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pending Transactions Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <FaReceipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Transaksi Gantung</h2>
                  <p className="text-sm text-gray-500">{pendingTransactions.length} transaksi tertunda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaReceipt className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada transaksi tertunda</p>
                </div>
              ) : (
                pendingTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">Transaksi #{index + 1}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.time).toLocaleTimeString('id-ID')} - {transaction.cart.length} item
                        </p>
                      </div>
                      <p className="text-xl font-bold text-yellow-600">
                        Rp {transaction.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCart(transaction.cart);
                          setPendingTransactions(pendingTransactions.filter(t => t.id !== transaction.id));
                          setShowPendingModal(false);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Lanjutkan
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Hapus transaksi ini?')) {
                            setPendingTransactions(pendingTransactions.filter(t => t.id !== transaction.id));
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Professional Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                  <FaReceipt className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Pembayaran</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Professional Total Display */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm opacity-90 font-medium">Total Pembayaran</p>
                <FaTag className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-4xl font-bold mb-1">Rp {total.toLocaleString('id-ID')}</p>
              <p className="text-sm opacity-75">{cart.length} item dalam keranjang</p>
            </div>

            {/* Professional Payment Method */}
            <div className="mb-6">
              <label className="block text-base font-bold text-gray-900 mb-4">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'cash' ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <FaMoneyBillWave className={`w-7 h-7 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-600'}`}>
                    Tunai
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'card'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'card' ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}>
                    <FaCreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-600'}`}>
                    Kartu
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'qris'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'qris' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <FaQrcode className={`w-7 h-7 ${paymentMethod === 'qris' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'qris' ? 'text-blue-600' : 'text-gray-600'}`}>
                    QRIS
                  </span>
                </button>
              </div>
            </div>

            {/* Professional Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-base font-bold text-gray-900 mb-3">
                  💵 Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">Rp</span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-xl font-bold text-gray-900 transition-all"
                  />
                </div>
                {cashReceived && (
                  <div className={`mt-4 p-5 rounded-xl border-2 ${
                    calculateChange() >= 0 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-bold">Kembalian</span>
                      <span className={`font-bold text-2xl ${
                        calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rp {Math.abs(calculateChange()).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {calculateChange() < 0 && (
                      <p className="text-red-600 text-sm mt-2 font-medium">⚠️ Uang kurang!</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Professional Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-base"
              >
                Batal
              </button>
              <button
                onClick={processPayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
              >
                <FaCheck className="w-5 h-5" />
                <span>Proses Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Management Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${shiftAction === 'open' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                  <FaClock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {shiftAction === 'open' ? 'Buka Shift' : 'Tutup Shift'}
                </h2>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {shiftAction === 'open' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-semibold mb-2">Informasi Kasir</p>
                  <p className="text-sm text-blue-700">Nama: {session?.user?.name || 'Kasir'}</p>
                  <p className="text-sm text-blue-700">Waktu: {new Date().toLocaleString('id-ID')}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modal Awal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                    <input
                      type="number"
                      defaultValue="1000000"
                      className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg font-bold"
                      id="openingBalance"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const openingBalance = (document.getElementById('openingBalance') as HTMLInputElement)?.value || '1000000';
                      setActiveShift({
                        id: Date.now().toString(),
                        shiftType: 'Pagi',
                        startTime: new Date(),
                        openingBalance: parseFloat(openingBalance),
                        totalTransactions: 0,
                        totalSales: 0,
                        cashSales: 0,
                        cardSales: 0,
                        ewalletSales: 0
                      });
                      setTransactionCount(0);
                      setShowShiftModal(false);
                      alert('Shift berhasil dibuka!');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    Buka Shift
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">REKAP SHIFT</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transaksi:</span>
                      <span className="font-bold">{activeShift?.totalTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Penjualan:</span>
                      <span className="font-bold text-blue-600">
                        Rp {(activeShift?.totalSales || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• Cash:</span>
                      <span>Rp {(activeShift?.cashSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• Card:</span>
                      <span>Rp {(activeShift?.cardSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• E-Wallet:</span>
                      <span>Rp {(activeShift?.ewalletSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-900 font-semibold mb-1">⚠️ Perhatian</p>
                  <p className="text-xs text-yellow-700">
                    Pastikan Anda sudah menghitung cash di laci sebelum menutup shift.
                    Untuk rekap lengkap, gunakan halaman Shift Management.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      setActiveShift(null);
                      setShowShiftModal(false);
                      alert('Shift ditutup! Silakan lakukan rekap lengkap di halaman Shift Management.');
                      router.push('/pos/shifts-complete');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    Tutup Shift
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

{/* Add Customer Wizard - Integrated from Customers Module */}
      <AddCustomerWizard
        isOpen={showAddMemberForm}
        onClose={() => {
          setShowAddMemberForm(false);
          setNewMember({ name: '', phone: '', discount: 10 });
        }}
        onSuccess={() => {
          setShowAddMemberForm(false);
          setNewMember({ name: '', phone: '', discount: 10 });
          fetchMembers(); // Refresh members list
          alert('Member baru berhasil ditambahkan!');
        }}
      />

      {/* Payment Success Modal */}
      {showSuccessModal && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
              {/* Success Card */}
              <div className="md:w-1/3 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <FaCheck className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Pembayaran Berhasil!</h2>
                  <p className="text-green-100 mb-6">Transaksi Anda telah diproses dengan sukses</p>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-100">No. Transaksi</span>
                      <span className="font-bold">{receiptData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-100">Total</span>
                      <span className="font-bold text-lg">Rp {receiptData.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-100">Metode</span>
                      <span className="font-bold capitalize">{receiptData.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="md:w-2/3 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Struk Pembelian</h3>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  {/* Printable Receipt */}
                  <div id="receipt-print" className="no-print-screen">
                    <style jsx global>{`
                      @media print {
                        body * {
                          visibility: hidden;
                        }
                        #receipt-print,
                        #receipt-print * {
                          visibility: visible;
                        }
                        #receipt-print {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 100%;
                          max-width: 300px;
                          margin: 0 auto;
                          padding: 20px;
                          background: white;
                        }
                        #receipt-print .bg-gray-50 {
                          background: white !important;
                        }
                        #receipt-print .border-gray-200,
                        #receipt-print .border-gray-300 {
                          border-color: black !important;
                        }
                        #receipt-print .border-b-2 {
                          border-bottom: 2px solid black !important;
                        }
                        #receipt-print .text-gray-900 {
                          color: black !important;
                        }
                        #receipt-print .text-gray-600 {
                          color: #333 !important;
                        }
                        #receipt-print .text-green-600 {
                          color: black !important;
                        }
                        #receipt-print .text-xs {
                          font-size: 10px !important;
                        }
                        #receipt-print .text-sm {
                          font-size: 12px !important;
                        }
                        #receipt-print .text-lg {
                          font-size: 16px !important;
                        }
                        #receipt-print .text-xl {
                          font-size: 18px !important;
                        }
                        #receipt-print .rounded-2xl {
                          border-radius: 0 !important;
                        }
                        #receipt-print .rounded-xl {
                          border-radius: 0 !important;
                        }
                        #receipt-print .p-6 {
                          padding: 10px !important;
                        }
                        #receipt-print .p-4 {
                          padding: 5px !important;
                        }
                        #receipt-print .mb-6 {
                          margin-bottom: 10px !important;
                        }
                        #receipt-print .mb-4 {
                          margin-bottom: 5px !important;
                        }
                        #receipt-print .pb-4 {
                          padding-bottom: 5px !important;
                        }
                        #receipt-print .pb-2 {
                          padding-bottom: 2px !important;
                        }
                        #receipt-print .space-y-2 > * + * {
                          margin-top: 2px !important;
                        }
                        #receipt-print .space-y-1 > * + * {
                          margin-top: 1px !important;
                        }
                      }
                      .no-print-screen {
                        display: block;
                      }
                      @media screen {
                        .no-print-screen {
                          display: block;
                        }
                      }
                    `}</style>
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                    {/* Receipt Header */}
                    <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                      <h4 className="text-xl font-bold text-gray-900">BEDAGANG STORE</h4>
                      <p className="text-sm text-gray-600">Jl. Contoh No. 123, Jakarta</p>
                      <p className="text-sm text-gray-600">Telp: 021-12345678</p>
                    </div>

                    {/* Transaction Info */}
                    <div className="mb-4 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">No. Transaksi:</span>
                        <span className="font-semibold">{receiptData.id}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="font-semibold">{receiptData.date}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Kasir:</span>
                        <span className="font-semibold">{receiptData.cashier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pelanggan:</span>
                        <span className="font-semibold">{receiptData.customerName}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4 pb-4 border-b-2 border-gray-300">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-600">
                            <th className="text-left pb-2">Item</th>
                            <th className="text-center pb-2">Qty</th>
                            <th className="text-right pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receiptData.items.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2">
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')}</div>
                              </td>
                              <td className="text-center py-2">{item.qty}</td>
                              <td className="text-right py-2 font-semibold">
                                Rp {item.subtotal.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>Rp {receiptData.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      {receiptData.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Diskon:</span>
                          <span>-Rp {receiptData.discount.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-gray-300">
                        <span>TOTAL:</span>
                        <span className="text-green-600">Rp {receiptData.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-gray-100 rounded-xl p-4 text-sm space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metode Pembayaran:</span>
                        <span className="font-semibold capitalize">{receiptData.paymentMethod}</span>
                      </div>
                      {receiptData.paymentMethod === 'cash' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tunai Diterima:</span>
                            <span>Rp {receiptData.cashReceived.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-green-600">
                            <span>Kembalian:</span>
                            <span>Rp {receiptData.change.toLocaleString('id-ID')}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500 pt-4 border-t-2 border-gray-300">
                      <p>Terima kasih telah berbelanja</p>
                      <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      // Print receipt logic
                      window.print();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    <FaReceipt className="w-5 h-5" />
                    <span>Cetak Struk</span>
                  </button>
                  <button
                    onClick={() => {
                      // Send receipt logic
                      alert('Struk telah dikirim ke email pelanggan!');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    <FaReceipt className="w-5 h-5" />
                    <span>Kirim Struk</span>
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hold Transaction Confirmation Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Tahan Transaksi</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nama Customer (Optional)
              </label>
              <input
                type="text"
                value={holdCustomerName}
                onChange={(e) => setHoldCustomerName(e.target.value)}
                placeholder="Masukkan nama customer"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Alasan Ditahan (Optional)
              </label>
              <textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Contoh: Customer perlu ambil item tambahan"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowHoldModal(false);
                  setHoldCustomerName('');
                  setHoldReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleHoldTransaction}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-all font-semibold"
              >
                Tahan Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Transactions List Modal */}
      {showHeldListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Transaksi Ditahan</h3>
              <button
                onClick={() => setShowHeldListModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            {heldTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Tidak ada transaksi yang ditahan
              </p>
            ) : (
              <div className="space-y-3">
                {heldTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg">{tx.holdNumber}</div>
                        <div className="text-sm text-gray-600">
                          {tx.customerName || 'Walk-in Customer'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          Rp {tx.total.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {tx.itemCount} items
                        </div>
                      </div>
                    </div>
                    
                    {tx.holdReason && (
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Alasan:</span> {tx.holdReason}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Ditahan: {new Date(tx.heldAt).toLocaleString('id-ID')}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResumeTransaction(tx.id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        Resume
                      </button>
                      <button
                        onClick={() => handleCancelHeld(tx.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        Batalkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CashierPage;
