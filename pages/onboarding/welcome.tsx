import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Store, ChefHat, Coffee, Zap, Building2, ArrowRight,
  Check, Sparkles, Package, Users, BarChart3,
  LogOut, User, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BUSINESS_TYPES = [
  {
    code: 'fine_dining',
    name: 'Fine Dining',
    description: 'Restoran mewah dengan layanan lengkap',
    icon: ChefHat,
    color: 'from-purple-500 to-pink-500',
    features: ['Table Management', 'Reservation', 'Kitchen Display', 'Recipe Management']
  },
  {
    code: 'cloud_kitchen',
    name: 'Cloud Kitchen',
    description: 'Dapur virtual untuk delivery',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: ['Online Ordering', 'Delivery Management', 'Kitchen Display', 'Inventory']
  },
  {
    code: 'qsr',
    name: 'Quick Service Restaurant',
    description: 'Restoran cepat saji',
    icon: Store,
    color: 'from-red-500 to-pink-500',
    features: ['POS', 'Kitchen Display', 'Inventory', 'Loyalty Program']
  },
  {
    code: 'cafe',
    name: 'Cafe',
    description: 'Kafe dengan menu minuman dan snack',
    icon: Coffee,
    color: 'from-green-500 to-teal-500',
    features: ['POS', 'Table Management', 'Recipe Management', 'Inventory']
  }
];

export default function WelcomeOnboarding() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [creating, setCreating] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateTenant = async () => {
    if (!businessName.trim()) {
      toast.error('Nama bisnis harus diisi');
      return;
    }
    if (!selectedType) {
      toast.error('Pilih jenis bisnis');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/onboarding/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessTypeCode: selectedType
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Gagal membuat tenant');
      }

      toast.success('Tenant berhasil dibuat!');
      
      // Redirect to KYB
      setTimeout(() => {
        router.push('/onboarding/kyb');
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat tenant');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Welcome - BEDAGANG ERP</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
                BEDAGANG
              </h1>
            </div>

            {/* Profile & Logout */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[150px] truncate">
                  {session?.user?.name || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email || '-'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/profile');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Profil Saya</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: '/auth/login' });
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Selamat Datang, {session?.user?.name}!
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Mari kita mulai dengan memilih jenis bisnis Anda dan melengkapi informasi dasar.
            </p>
          </motion.div>

          {/* Business Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nama Bisnis Anda</h3>
            <p className="text-gray-600 mb-6">Masukkan nama resmi bisnis atau outlet Anda</p>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Warung Kopi Sejahtera"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 transition-all text-lg"
            />
          </motion.div>

          {/* Business Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Jenis Bisnis</h3>
            <p className="text-gray-600 mb-6">Pilih kategori yang paling sesuai dengan bisnis Anda</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BUSINESS_TYPES.map((type, idx) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.code;

                return (
                  <motion.button
                    key={type.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    onClick={() => setSelectedType(type.code)}
                    className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{type.description}</p>

                    <div className="space-y-1">
                      {type.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <Check className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white mb-8"
          >
            <h3 className="text-2xl font-bold mb-6">Yang Akan Anda Dapatkan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Modul Lengkap</h4>
                  <p className="text-sm text-sky-100">POS, Inventory, Finance, dan lebih banyak lagi</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Multi-User</h4>
                  <p className="text-sm text-sky-100">Kelola tim dengan role & permission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Analytics</h4>
                  <p className="text-sm text-sky-100">Laporan lengkap dan real-time insights</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <button
              onClick={handleCreateTenant}
              disabled={!businessName.trim() || !selectedType || creating}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan ke KYB</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Proses selanjutnya: Verifikasi bisnis (KYB) → Pilih paket → Aktivasi
            </p>
          </motion.div>
        </main>
      </div>
    </>
  );
}
