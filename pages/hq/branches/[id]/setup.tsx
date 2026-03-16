import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HQLayout from '../../../../components/hq/HQLayout';
import {
  Building2,
  Check,
  ChevronRight,
  Clock,
  Package,
  Users,
  CreditCard,
  Printer,
  Settings,
  ShoppingCart,
  ChefHat,
  LayoutGrid,
  Calendar,
  Gift,
  DollarSign,
  Truck,
  Percent,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Circle,
  Loader2,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface SetupStep {
  step: number;
  name: string;
  key: string;
  description: string;
  isCompleted: boolean;
  isOptional: boolean;
}

interface ModuleItem {
  code: string;
  name: string;
  description: string;
  icon: string;
  isCore: boolean;
  isEnabled: boolean;
}

interface BranchInfo {
  id: string;
  name: string;
  code: string;
  type: string;
}

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  Package,
  ChefHat,
  LayoutGrid,
  Calendar,
  Gift,
  DollarSign,
  Users,
  Truck,
  Percent
};

export default function BranchSetupWizard() {
  const router = useRouter();
  const { id } = router.query;
  const branchId = id as string;

  const MOCK_SETUP_STEPS: SetupStep[] = [
    { step: 1, name: 'Informasi Dasar', key: 'basic', description: 'Jam operasional dan info dasar', isCompleted: true, isOptional: false },
    { step: 2, name: 'Modul Aktif', key: 'modules', description: 'Pilih modul yang akan diaktifkan', isCompleted: true, isOptional: false },
    { step: 3, name: 'Pengguna', key: 'users', description: 'Tambah pengguna cabang', isCompleted: false, isOptional: false },
    { step: 4, name: 'Inventori', key: 'inventory', description: 'Pengaturan stok awal', isCompleted: false, isOptional: false },
    { step: 5, name: 'Pembayaran', key: 'payment', description: 'Metode pembayaran', isCompleted: false, isOptional: false },
    { step: 6, name: 'Printer', key: 'printer', description: 'Konfigurasi printer', isCompleted: false, isOptional: true },
  ];
  const MOCK_MODULES: ModuleItem[] = [
    { code: 'pos', name: 'Point of Sale', description: 'Kasir & transaksi', icon: 'ShoppingCart', isCore: true, isEnabled: true },
    { code: 'inventory', name: 'Inventory', description: 'Manajemen stok', icon: 'Package', isCore: true, isEnabled: true },
    { code: 'kitchen', name: 'Kitchen Display', description: 'Tampilan dapur', icon: 'ChefHat', isCore: false, isEnabled: false },
  ];
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<SetupStep[]>(MOCK_SETUP_STEPS);
  const [progress, setProgress] = useState(33);
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>({ id: 'b1', name: 'Cabang Baru', code: 'BR-NEW', type: 'standard' });
  const [initStatus, setInitStatus] = useState<{
    isFullyInitialized: boolean;
    services: Record<string, { initialized: boolean; count?: number }>;
  } | null>(null);

  // Step 1: Basic Info
  const [operatingHours, setOperatingHours] = useState([
    { day: 'Senin', open: '08:00', close: '22:00', isOpen: true },
    { day: 'Selasa', open: '08:00', close: '22:00', isOpen: true },
    { day: 'Rabu', open: '08:00', close: '22:00', isOpen: true },
    { day: 'Kamis', open: '08:00', close: '22:00', isOpen: true },
    { day: 'Jumat', open: '08:00', close: '22:00', isOpen: true },
    { day: 'Sabtu', open: '08:00', close: '23:00', isOpen: true },
    { day: 'Minggu', open: '09:00', close: '21:00', isOpen: true }
  ]);

  // Step 2: Modules
  const [modules, setModules] = useState<ModuleItem[]>(MOCK_MODULES);

  // Step 3: Users
  const [users, setUsers] = useState([
    { name: '', email: '', role: 'cashier', phone: '' }
  ]);

  // Step 4: Inventory
  const [inventorySettings, setInventorySettings] = useState({
    syncFromHQ: true,
    lowStockThreshold: 10,
    autoReorder: false
  });

  // Step 5: Payment
  const [paymentMethods, setPaymentMethods] = useState([
    { code: 'cash', name: 'Tunai', enabled: true },
    { code: 'debit', name: 'Kartu Debit', enabled: true },
    { code: 'credit', name: 'Kartu Kredit', enabled: true },
    { code: 'qris', name: 'QRIS', enabled: true },
    { code: 'transfer', name: 'Transfer Bank', enabled: false },
    { code: 'ewallet', name: 'E-Wallet', enabled: true }
  ]);

  // Step 6: Printer
  const [printers, setPrinters] = useState([
    { name: 'Printer Kasir', type: 'receipt', ip: '', port: '9100', isDefault: true }
  ]);

  useEffect(() => {
    setMounted(true);
    if (branchId) {
      fetchSetupStatus();
      fetchBranchInfo();
      fetchModules();
      fetchInitStatus();
    }
  }, [branchId]);

  const fetchSetupStatus = async () => {
    try {
      const response = await fetch(`/api/hq/branches/${branchId}/setup`);
      if (response.ok) {
        const data = await response.json();
        setSteps(data.steps || []);
        setProgress(data.progress || 0);
        setCurrentStep(data.setup?.currentStep || 1);
      }
    } catch (error) {
      console.error('Error fetching setup status:', error);
      setSteps(MOCK_SETUP_STEPS);
      setProgress(33);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitStatus = async () => {
    try {
      const response = await fetch(`/api/hq/branches/${branchId}/initialize`);
      if (response.ok) {
        const data = await response.json();
        setInitStatus({
          isFullyInitialized: data.isFullyInitialized,
          services: data.services || {}
        });
      }
    } catch (error) {
      console.error('Error fetching init status:', error);
    }
  };

  const fetchBranchInfo = async () => {
    try {
      const response = await fetch(`/api/hq/branches/${branchId}`);
      if (response.ok) {
        const data = await response.json();
        setBranchInfo(data.branch);
      }
    } catch (error) {
      console.error('Error fetching branch info:', error);
      setBranchInfo({ id: branchId, name: 'Cabang Baru', code: 'BR-NEW', type: 'standard' });
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/hq/branches/${branchId}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules(MOCK_MODULES);
    }
  };

  const initializeSetup = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/hq/branches/${branchId}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 })
      });
      if (response.ok) {
        await fetchSetupStatus();
      }
    } catch (error) {
      console.error('Error initializing setup:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveCurrentStep = async () => {
    setSaving(true);
    try {
      let stepKey = '';
      let data: any = {};

      switch (currentStep) {
        case 1:
          stepKey = 'basic_info';
          data = { operatingHours };
          break;
        case 2:
          stepKey = 'modules';
          data = { modules };
          // Also update modules
          await fetch(`/api/hq/branches/${branchId}/modules`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modules, userId: 1 })
          });
          break;
        case 3:
          stepKey = 'users';
          data = { users: users.filter(u => u.name && u.email) };
          break;
        case 4:
          stepKey = 'inventory';
          data = inventorySettings;
          break;
        case 5:
          stepKey = 'payment';
          data = { paymentMethods };
          break;
        case 6:
          stepKey = 'printer';
          data = { printers };
          break;
      }

      const response = await fetch(`/api/hq/branches/${branchId}/setup`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey, data, userId: 1 })
      });

      if (response.ok) {
        const result = await response.json();
        setSteps(result.steps || steps);
        setProgress(result.setup?.progress || progress);
        
        if (currentStep < 6) {
          setCurrentStep(currentStep + 1);
        } else {
          // Setup completed
          router.push(`/hq/branches/${branchId}`);
        }
      }
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (code: string) => {
    setModules(modules.map(m => 
      m.code === code && !m.isCore 
        ? { ...m, isEnabled: !m.isEnabled }
        : m
    ));
  };

  const addUser = () => {
    setUsers([...users, { name: '', email: '', role: 'cashier', phone: '' }]);
  };

  const removeUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const updateUser = (index: number, field: string, value: string) => {
    setUsers(users.map((u, i) => i === index ? { ...u, [field]: value } : u));
  };

  const togglePayment = (code: string) => {
    setPaymentMethods(paymentMethods.map(p => 
      p.code === code ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const addPrinter = () => {
    setPrinters([...printers, { name: '', type: 'receipt', ip: '', port: '9100', isDefault: false }]);
  };

  const removePrinter = (index: number) => {
    setPrinters(printers.filter((_, i) => i !== index));
  };

  if (!mounted) return null;

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return Clock;
      case 2: return Settings;
      case 3: return Users;
      case 4: return Package;
      case 5: return CreditCard;
      case 6: return Printer;
      default: return Circle;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Jam Operasional</h3>
              <div className="space-y-3">
                {operatingHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={schedule.isOpen}
                        onChange={(e) => {
                          const updated = [...operatingHours];
                          updated[index].isOpen = e.target.checked;
                          setOperatingHours(updated);
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-600">Buka</span>
                    </label>
                    {schedule.isOpen && (
                      <>
                        <input
                          type="time"
                          value={schedule.open}
                          onChange={(e) => {
                            const updated = [...operatingHours];
                            updated[index].open = e.target.value;
                            setOperatingHours(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={schedule.close}
                          onChange={(e) => {
                            const updated = [...operatingHours];
                            updated[index].close = e.target.value;
                            setOperatingHours(updated);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Modul</h3>
              <p className="text-sm text-gray-500 mb-4">Modul yang ditandai sebagai "Core" wajib diaktifkan</p>
              <div className="grid grid-cols-2 gap-4">
                {modules.map((mod) => {
                  const IconComponent = iconMap[mod.icon] || Package;
                  return (
                    <div
                      key={mod.code}
                      onClick={() => toggleModule(mod.code)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        mod.isEnabled
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${mod.isCore ? 'opacity-90' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          mod.isEnabled ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          mod.isEnabled ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {mod.isEnabled && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{mod.name}</span>
                          {mod.isCore && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tambah Pengguna</h3>
                <p className="text-sm text-gray-500">Tambahkan staff yang akan bekerja di cabang ini</p>
              </div>
              <button
                onClick={addUser}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Pengguna #{index + 1}</span>
                    {users.length > 1 && (
                      <button
                        onClick={() => removeUser(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={user.name}
                      onChange={(e) => updateUser(index, 'name', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={user.email}
                      onChange={(e) => updateUser(index, 'email', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="tel"
                      placeholder="No. Telepon"
                      value={user.phone}
                      onChange={(e) => updateUser(index, 'phone', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(index, 'role', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="manager">Manager</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="cashier">Kasir</option>
                      <option value="inventory">Staff Gudang</option>
                      <option value="kitchen">Staff Dapur</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Inventori</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-medium text-gray-900">Sinkronisasi dari HQ</span>
                    <p className="text-sm text-gray-500">Produk dan kategori akan disinkronisasi dari pusat</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inventorySettings.syncFromHQ}
                    onChange={(e) => setInventorySettings({ ...inventorySettings, syncFromHQ: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block">
                    <span className="font-medium text-gray-900">Batas Stok Rendah</span>
                    <p className="text-sm text-gray-500 mb-2">Alert akan muncul jika stok di bawah nilai ini</p>
                    <input
                      type="number"
                      value={inventorySettings.lowStockThreshold}
                      onChange={(e) => setInventorySettings({ ...inventorySettings, lowStockThreshold: parseInt(e.target.value) })}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                  </label>
                </div>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-medium text-gray-900">Auto Reorder</span>
                    <p className="text-sm text-gray-500">Buat PO otomatis saat stok rendah</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inventorySettings.autoReorder}
                    onChange={(e) => setInventorySettings({ ...inventorySettings, autoReorder: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <label
                    key={method.code}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      method.enabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${method.enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${method.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {method.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={() => togglePayment(method.code)}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Konfigurasi Printer</h3>
                <p className="text-sm text-gray-500">Tambahkan printer untuk struk dan dapur</p>
              </div>
              <button
                onClick={addPrinter}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
            <div className="space-y-4">
              {printers.map((printer, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Printer #{index + 1}</span>
                    {printers.length > 1 && (
                      <button
                        onClick={() => removePrinter(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nama Printer"
                      value={printer.name}
                      onChange={(e) => {
                        const updated = [...printers];
                        updated[index].name = e.target.value;
                        setPrinters(updated);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={printer.type}
                      onChange={(e) => {
                        const updated = [...printers];
                        updated[index].type = e.target.value;
                        setPrinters(updated);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="receipt">Struk Kasir</option>
                      <option value="kitchen">Dapur</option>
                      <option value="bar">Bar</option>
                      <option value="label">Label</option>
                    </select>
                    <input
                      type="text"
                      placeholder="IP Address"
                      value={printer.ip}
                      onChange={(e) => {
                        const updated = [...printers];
                        updated[index].ip = e.target.value;
                        setPrinters(updated);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Port"
                      value={printer.port}
                      onChange={(e) => {
                        const updated = [...printers];
                        updated[index].port = e.target.value;
                        setPrinters(updated);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={printer.isDefault}
                      onChange={(e) => {
                        const updated = printers.map((p, i) => ({
                          ...p,
                          isDefault: i === index ? e.target.checked : false
                        }));
                        setPrinters(updated);
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">Jadikan default</span>
                  </label>
                </div>
              ))}
              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Konfigurasi printer dapat dilewati dan diatur nanti di pengaturan cabang.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <HQLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/hq/branches')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Cabang
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Setup Cabang Baru
              </h1>
              <p className="text-gray-500">
                {branchInfo?.name || 'Memuat...'} • {branchInfo?.code || ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Steps */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-purple-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {steps.map((step) => {
                  const StepIcon = getStepIcon(step.step);
                  const isActive = currentStep === step.step;
                  const isCompleted = step.isCompleted;

                  return (
                    <button
                      key={step.step}
                      onClick={() => setCurrentStep(step.step)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-purple-50 border-2 border-purple-500'
                          : isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-purple-500 text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-purple-700' : isCompleted ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {step.name}
                        </div>
                        {step.isOptional && (
                          <span className="text-xs text-gray-400">Opsional</span>
                        )}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-purple-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Initialized Services */}
            {initStatus && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Layanan Terinisialisasi</h3>
                <div className="space-y-2">
                  {Object.entries(initStatus.services).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      {value.initialized ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          {value.count !== undefined && `(${value.count})`}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  ))}
                </div>
                {initStatus.isFullyInitialized && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-green-600 font-medium">Semua layanan siap</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {steps.find(s => s.step === currentStep)?.name || `Step ${currentStep}`}
                </h2>
                <p className="text-gray-500">
                  {steps.find(s => s.step === currentStep)?.description || ''}
                </p>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                ) : (
                  renderStepContent()
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <div className="flex items-center gap-3">
                  {steps.find(s => s.step === currentStep)?.isOptional && (
                    <button
                      onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      Lewati
                    </button>
                  )}
                  <button
                    onClick={saveCurrentStep}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentStep === 6 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                      </>
                    ) : (
                      <>
                        Lanjutkan
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HQLayout>
  );
}
