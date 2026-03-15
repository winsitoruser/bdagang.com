import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { 
  FaClock, FaPlay, FaStop, FaUser, FaMoneyBillWave,
  FaCalendar, FaDownload, FaEye, FaExchangeAlt, FaTimes,
  FaCheck, FaPrint, FaFileDownload
} from 'react-icons/fa';

interface Shift {
  id: string;
  shiftNumber: string;
  cashierName: string;
  shiftType: 'pagi' | 'siang' | 'malam';
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  totalTransactions: number;
  cashSales: number;
  cardSales: number;
  ewalletSales: number;
  totalSales: number;
  status: 'active' | 'closed' | 'handed_over';
  handoverTo?: string;
  handoverAmount?: number;
}

const ShiftsCompletePage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  
  // Modal states
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  
  // Form states - Open Shift
  const [shiftType, setShiftType] = useState<'pagi' | 'siang' | 'malam'>('pagi');
  const [openingBalance, setOpeningBalance] = useState('1000000');
  const [openingNotes, setOpeningNotes] = useState('');
  
  // Form states - Close Shift
  const [cashBreakdown, setCashBreakdown] = useState({
    note100k: 0,
    note50k: 0,
    note20k: 0,
    note10k: 0,
    note5k: 0,
    note2k: 0,
    note1k: 0,
    coins: 0
  });
  const [closingNotes, setClosingNotes] = useState('');
  
  // Form states - Handover
  const [handoverTo, setHandoverTo] = useState('');
  const [handoverAmount, setHandoverAmount] = useState('');
  const [handoverPin, setHandoverPin] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Mock data
  React.useEffect(() => {
    const mockShifts: Shift[] = [
      {
        id: '1',
        shiftNumber: 'SHF-001',
        cashierName: 'John Doe',
        shiftType: 'pagi',
        startTime: '2026-01-29 08:00:00',
        endTime: '2026-01-29 16:00:00',
        openingBalance: 1000000,
        closingBalance: 7850000,
        expectedBalance: 7800000,
        difference: 50000,
        totalTransactions: 156,
        cashSales: 6800000,
        cardSales: 3600000,
        ewalletSales: 500000,
        totalSales: 10900000,
        status: 'closed'
      }
    ];
    setShifts(mockShifts);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateActualCash = () => {
    return (
      cashBreakdown.note100k * 100000 +
      cashBreakdown.note50k * 50000 +
      cashBreakdown.note20k * 20000 +
      cashBreakdown.note10k * 10000 +
      cashBreakdown.note5k * 5000 +
      cashBreakdown.note2k * 2000 +
      cashBreakdown.note1k * 1000 +
      cashBreakdown.coins
    );
  };

  const handleOpenShift = async () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      shiftNumber: `SHF-${String(shifts.length + 1).padStart(3, '0')}`,
      cashierName: session?.user?.name || 'Kasir',
      shiftType,
      startTime: new Date().toISOString(),
      openingBalance: parseFloat(openingBalance),
      totalTransactions: 0,
      cashSales: 0,
      cardSales: 0,
      ewalletSales: 0,
      totalSales: 0,
      status: 'active'
    };
    
    setActiveShift(newShift);
    setShifts([newShift, ...shifts]);
    setShowOpenShiftModal(false);
    alert('Shift berhasil dibuka!');
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;
    
    const actualCash = calculateActualCash();
    const expectedCash = activeShift.openingBalance + activeShift.cashSales;
    const difference = actualCash - expectedCash;
    
    const updatedShift: Shift = {
      ...activeShift,
      endTime: new Date().toISOString(),
      closingBalance: actualCash,
      expectedBalance: expectedCash,
      difference,
      status: 'closed'
    };
    
    setShifts(shifts.map(s => s.id === activeShift.id ? updatedShift : s));
    setActiveShift(null);
    setShowCloseShiftModal(false);
    alert(`Shift ditutup! Selisih: ${formatCurrency(difference)}`);
  };

  const handleHandover = async () => {
    if (!activeShift || handoverPin !== '1234') {
      alert('PIN salah!');
      return;
    }
    
    const updatedShift: Shift = {
      ...activeShift,
      status: 'handed_over',
      handoverTo,
      handoverAmount: parseFloat(handoverAmount)
    };
    
    setShifts(shifts.map(s => s.id === activeShift.id ? updatedShift : s));
    setActiveShift(null);
    setShowHandoverModal(false);
    alert('Serah terima berhasil!');
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Shift...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Manajemen Shift | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manajemen Shift</h1>
              <p className="text-red-100">Kelola shift kasir, buka/tutup shift, dan serah terima</p>
            </div>
            <FaClock className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Current Shift Status */}
        {activeShift ? (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaPlay className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-green-100">Shift Aktif</p>
                  <p className="text-xl font-bold">{activeShift.cashierName} - Shift {activeShift.shiftType}</p>
                  <p className="text-sm text-green-100">
                    Dimulai: {new Date(activeShift.startTime).toLocaleTimeString('id-ID')} | 
                    Modal Awal: {formatCurrency(activeShift.openingBalance)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowHandoverModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                >
                  <FaExchangeAlt />
                  <span>Serah Terima</span>
                </button>
                <button 
                  onClick={() => setShowCloseShiftModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  <FaStop />
                  <span>Tutup Shift</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak Ada Shift Aktif</h3>
                <p className="text-sm text-gray-600">Mulai shift baru untuk memulai transaksi</p>
              </div>
              <button 
                onClick={() => setShowOpenShiftModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <FaPlay />
                <span>Buka Shift Baru</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Hari Ini</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Total Penjualan</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(shifts.reduce((sum, s) => sum + s.totalSales, 0))}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUser className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Total Transaksi</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {shifts.reduce((sum, s) => sum + s.totalTransactions, 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaCalendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Aktif</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeShift ? 1 : 0}</p>
          </div>
        </div>

        {/* Shift History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Shift</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penjualan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selisih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">{shift.shiftNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.cashierName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(shift.startTime).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatCurrency(shift.openingBalance)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(shift.totalSales)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shift.difference !== undefined && (
                        <span className={`text-sm font-semibold ${shift.difference > 0 ? 'text-green-600' : shift.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {shift.difference > 0 ? '+' : ''}{formatCurrency(shift.difference)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shift.status === 'active' ? 'bg-green-100 text-green-800' :
                        shift.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {shift.status === 'active' ? 'Aktif' : shift.status === 'closed' ? 'Ditutup' : 'Diserahkan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                        <FaEye />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Print">
                        <FaPrint />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Open Shift */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                  <FaPlay className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Buka Shift Baru</h2>
              </div>
              <button
                onClick={() => setShowOpenShiftModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kasir</label>
                <input
                  type="text"
                  value={session?.user?.name || 'Kasir'}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shift Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pagi', 'siang', 'malam'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setShiftType(type)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        shiftType === type
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Modal Awal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Optional)</label>
                <textarea
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400"
                  placeholder="Catatan pembukaan shift..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowOpenShiftModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleOpenShift}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  Buka Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Close Shift */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-xl">
                  <FaStop className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tutup Shift</h2>
              </div>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rekap Penjualan */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3">REKAP PENJUALAN</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transaksi:</span>
                    <span className="font-bold">{activeShift.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">• Cash:</span>
                    <span className="font-semibold">{formatCurrency(activeShift.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">• Card:</span>
                    <span className="font-semibold">{formatCurrency(activeShift.cardSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">• E-Wallet:</span>
                    <span className="font-semibold">{formatCurrency(activeShift.ewalletSales)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-blue-300">
                    <span className="font-bold text-gray-900">TOTAL:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(activeShift.totalSales)}</span>
                  </div>
                </div>
              </div>

              {/* Cash Management */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">CASH MANAGEMENT</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modal Awal:</span>
                    <span className="font-semibold">{formatCurrency(activeShift.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Sales:</span>
                    <span className="font-semibold">{formatCurrency(activeShift.cashSales)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-green-300">
                    <span className="font-bold text-gray-900">Expected Cash:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(activeShift.openingBalance + activeShift.cashSales)}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-2">Hitung Cash Aktual:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Rp 100.000', key: 'note100k', value: 100000 },
                    { label: 'Rp 50.000', key: 'note50k', value: 50000 },
                    { label: 'Rp 20.000', key: 'note20k', value: 20000 },
                    { label: 'Rp 10.000', key: 'note10k', value: 10000 },
                    { label: 'Rp 5.000', key: 'note5k', value: 5000 },
                    { label: 'Rp 2.000', key: 'note2k', value: 2000 },
                    { label: 'Rp 1.000', key: 'note1k', value: 1000 }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-20">{item.label}</span>
                      <span className="text-xs">×</span>
                      <input
                        type="number"
                        min="0"
                        value={cashBreakdown[item.key as keyof typeof cashBreakdown]}
                        onChange={(e) => setCashBreakdown({
                          ...cashBreakdown,
                          [item.key]: parseInt(e.target.value) || 0
                        })}
                        className="w-16 px-2 py-1 border-2 border-green-200 rounded text-sm text-center"
                      />
                      <span className="text-xs text-gray-600">
                        = {formatCurrency((cashBreakdown[item.key as keyof typeof cashBreakdown] || 0) * item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-xs text-gray-600 w-20">Koin</span>
                    <input
                      type="number"
                      min="0"
                      value={cashBreakdown.coins}
                      onChange={(e) => setCashBreakdown({
                        ...cashBreakdown,
                        coins: parseInt(e.target.value) || 0
                      })}
                      className="flex-1 px-2 py-1 border-2 border-green-200 rounded text-sm"
                      placeholder="Jumlah koin"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Aktual:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(calculateActualCash())}</span>
                  </div>
                </div>
              </div>

              {/* Selisih */}
              <div className={`rounded-xl p-4 border-2 ${
                calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) > 0
                  ? 'bg-green-50 border-green-200'
                  : calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) < 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">SELISIH:</span>
                  <span className={`text-2xl font-bold ${
                    calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) > 0
                      ? 'text-green-600'
                      : calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) > 0 ? '+' : ''}
                    {formatCurrency(calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales))}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) > 0
                    ? '✓ Kelebihan (OVER)'
                    : calculateActualCash() - (activeShift.openingBalance + activeShift.cashSales) < 0
                    ? '✗ Kekurangan (SHORT)'
                    : '✓ Pas (BALANCED)'}
                </p>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan Penutupan</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-400"
                  placeholder="Catatan penutupan shift..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleCloseShift}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Tutup Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Handover */}
      {showHandoverModal && activeShift && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <FaExchangeAlt className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Serah Terima Shift</h2>
              </div>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dari */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">DARI</h3>
                <p className="text-sm text-gray-600">Kasir: <span className="font-semibold">{activeShift.cashierName}</span></p>
                <p className="text-sm text-gray-600">Shift: <span className="font-semibold">{activeShift.shiftType}</span></p>
                <p className="text-sm text-gray-600">
                  Cash Tersedia: <span className="font-semibold text-green-600">{formatCurrency(activeShift.openingBalance + activeShift.cashSales)}</span>
                </p>
              </div>

              {/* Kepada */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kepada Kasir</label>
                <select
                  value={handoverTo}
                  onChange={(e) => setHandoverTo(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400"
                >
                  <option value="">Pilih Kasir...</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Bob Wilson">Bob Wilson</option>
                  <option value="Alice Brown">Alice Brown</option>
                </select>
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Serah Terima</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                  <input
                    type="number"
                    value={handoverAmount}
                    onChange={(e) => setHandoverAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-yellow-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400 text-lg font-bold"
                    placeholder="1000000"
                  />
                </div>
                {handoverAmount && (
                  <p className="text-sm text-gray-600 mt-2">
                    Sisa (Disetor): <span className="font-semibold text-blue-600">
                      {formatCurrency((activeShift.openingBalance + activeShift.cashSales) - parseFloat(handoverAmount || '0'))}
                    </span>
                  </p>
                )}
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
                <textarea
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-200 focus:border-yellow-400"
                  placeholder="Catatan serah terima..."
                />
              </div>

              {/* Verifikasi */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-2">VERIFIKASI PENERIMA</h3>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Kasir Penerima</label>
                <input
                  type="password"
                  value={handoverPin}
                  onChange={(e) => setHandoverPin(e.target.value)}
                  maxLength={4}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-400 text-center text-2xl font-bold tracking-widest"
                  placeholder="****"
                />
                <p className="text-xs text-gray-500 mt-1">Demo PIN: 1234</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowHandoverModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleHandover}
                  disabled={!handoverTo || !handoverAmount || !handoverPin}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Serah Terima
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ShiftsCompletePage;
