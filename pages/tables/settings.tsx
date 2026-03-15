import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { 
  FaCog, FaSave, FaUndo, FaPlus, FaTrash, FaEdit,
  FaTable, FaMapMarkedAlt, FaLayerGroup
} from 'react-icons/fa';

interface FloorConfig {
  floor: number;
  name: string;
  isActive: boolean;
}

interface AreaConfig {
  id: string;
  name: string;
  description: string;
  color: string;
}

const TableSettingsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  const [floors, setFloors] = useState<FloorConfig[]>([
    { floor: 1, name: 'Lantai 1', isActive: true },
    { floor: 2, name: 'Lantai 2', isActive: false },
    { floor: 3, name: 'Lantai 3', isActive: false }
  ]);

  const [areas, setAreas] = useState<AreaConfig[]>([
    { id: '1', name: 'Indoor', description: 'Area dalam ruangan', color: '#3B82F6' },
    { id: '2', name: 'Outdoor', description: 'Area luar ruangan', color: '#10B981' },
    { id: '3', name: 'VIP', description: 'Area VIP eksklusif', color: '#F59E0B' },
    { id: '4', name: 'Smoking', description: 'Area merokok', color: '#6B7280' },
    { id: '5', name: 'Non-Smoking', description: 'Area bebas rokok', color: '#8B5CF6' }
  ]);

  const [settings, setSettings] = useState({
    defaultCapacity: 4,
    autoNumbering: true,
    numberPrefix: 'T-',
    enableReservations: true,
    maxReservationDays: 30,
    defaultDuration: 120,
    requireDeposit: false,
    depositAmount: 0
  });

  const [editingArea, setEditingArea] = useState<AreaConfig | null>(null);
  const [showAreaModal, setShowAreaModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSaveSettings = () => {
    // Save to localStorage or API
    localStorage.setItem('tableSettings', JSON.stringify({
      floors,
      areas,
      settings
    }));
    alert('Pengaturan berhasil disimpan!');
  };

  const handleResetSettings = () => {
    if (confirm('Reset semua pengaturan ke default?')) {
      // Reset to defaults
      setFloors([
        { floor: 1, name: 'Lantai 1', isActive: true },
        { floor: 2, name: 'Lantai 2', isActive: false },
        { floor: 3, name: 'Lantai 3', isActive: false }
      ]);
      setSettings({
        defaultCapacity: 4,
        autoNumbering: true,
        numberPrefix: 'T-',
        enableReservations: true,
        maxReservationDays: 30,
        defaultDuration: 120,
        requireDeposit: false,
        depositAmount: 0
      });
      alert('Pengaturan direset ke default!');
    }
  };

  const handleAddArea = () => {
    setEditingArea({
      id: Date.now().toString(),
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setShowAreaModal(true);
  };

  const handleSaveArea = () => {
    if (!editingArea) return;

    if (editingArea.id && areas.find(a => a.id === editingArea.id)) {
      // Update existing
      setAreas(areas.map(a => a.id === editingArea.id ? editingArea : a));
    } else {
      // Add new
      setAreas([...areas, editingArea]);
    }
    
    setShowAreaModal(false);
    setEditingArea(null);
  };

  const handleDeleteArea = (id: string) => {
    if (confirm('Hapus area ini?')) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Table Settings - Bedagang</title>
      </Head>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaCog className="text-sky-600" />
            Pengaturan Manajemen Meja
          </h1>
          <p className="text-gray-600 mt-2">Konfigurasi tata letak meja, area, dan pengaturan reservasi</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSaveSettings}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaSave />
            Simpan Pengaturan
          </button>
          <button
            onClick={handleResetSettings}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaUndo />
            Reset ke Default
          </button>
        </div>

        <div className="space-y-6">
          {/* Floor Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaLayerGroup className="text-sky-600" />
              Konfigurasi Lantai
            </h2>
            
            <div className="space-y-3">
              {floors.map((floor) => (
                <div key={floor.floor} className="flex items-center gap-4 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={floor.isActive}
                    onChange={(e) => setFloors(floors.map(f => 
                      f.floor === floor.floor ? {...f, isActive: e.target.checked} : f
                    ))}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={floor.name}
                      onChange={(e) => setFloors(floors.map(f => 
                        f.floor === floor.floor ? {...f, name: e.target.value} : f
                      ))}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {floor.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Area Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaMapMarkedAlt className="text-sky-600" />
                Konfigurasi Area
              </h2>
              <button
                onClick={handleAddArea}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                Tambah Area
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map((area) => (
                <div key={area.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: area.color }}
                      />
                      <div>
                        <h3 className="font-bold">{area.name}</h3>
                        <p className="text-sm text-gray-600">{area.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingArea(area);
                          setShowAreaModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaTable className="text-sky-600" />
              Pengaturan Meja
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kapasitas Default</label>
                <input
                  type="number"
                  value={settings.defaultCapacity}
                  onChange={(e) => setSettings({...settings, defaultCapacity: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prefix Nomor Meja</label>
                <input
                  type="text"
                  value={settings.numberPrefix}
                  onChange={(e) => setSettings({...settings, numberPrefix: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="T-"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoNumbering}
                    onChange={(e) => setSettings({...settings, autoNumbering: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Auto-numbering untuk meja baru</span>
                </label>
              </div>
            </div>
          </div>

          {/* Reservation Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Pengaturan Reservasi</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableReservations}
                  onChange={(e) => setSettings({...settings, enableReservations: e.target.checked})}
                  className="w-5 h-5"
                />
                <span className="font-medium">Aktifkan fitur reservasi</span>
              </label>

              {settings.enableReservations && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium mb-2">Maksimal Hari Reservasi</label>
                    <input
                      type="number"
                      value={settings.maxReservationDays}
                      onChange={(e) => setSettings({...settings, maxReservationDays: parseInt(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="365"
                    />
                    <p className="text-xs text-gray-500 mt-1">Berapa hari ke depan customer bisa reservasi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Durasi Default (menit)</label>
                    <input
                      type="number"
                      value={settings.defaultDuration}
                      onChange={(e) => setSettings({...settings, defaultDuration: parseInt(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="30"
                      max="480"
                      step="30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.requireDeposit}
                        onChange={(e) => setSettings({...settings, requireDeposit: e.target.checked})}
                        className="w-5 h-5"
                      />
                      <span className="font-medium">Wajibkan deposit untuk reservasi</span>
                    </label>
                  </div>

                  {settings.requireDeposit && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Jumlah Deposit (Rp)</label>
                      <input
                        type="number"
                        value={settings.depositAmount}
                        onChange={(e) => setSettings({...settings, depositAmount: parseInt(e.target.value)})}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                        step="10000"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Area Modal */}
        {showAreaModal && editingArea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {areas.find(a => a.id === editingArea.id) ? 'Edit Area' : 'Tambah Area'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Area</label>
                  <input
                    type="text"
                    value={editingArea.name}
                    onChange={(e) => setEditingArea({...editingArea, name: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Indoor, Outdoor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={editingArea.description}
                    onChange={(e) => setEditingArea({...editingArea, description: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Deskripsi area..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Warna</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editingArea.color}
                      onChange={(e) => setEditingArea({...editingArea, color: e.target.value})}
                      className="w-16 h-10 border rounded"
                    />
                    <input
                      type="text"
                      value={editingArea.color}
                      onChange={(e) => setEditingArea({...editingArea, color: e.target.value})}
                      className="flex-1 border rounded px-3 py-2"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAreaModal(false);
                    setEditingArea(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveArea}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TableSettingsPage;
