import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import VehicleFormModal from '../../../components/hq/fleet/VehicleFormModal';
import DriverFormModal from '../../../components/hq/fleet/DriverFormModal';
import { 
  Truck, 
  Users, 
  Activity, 
  Wrench, 
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface Vehicle {
  id: string;
  vehicleNumber: string;
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
  status: string;
  currentOdometerKm: number;
  nextServiceDueKm: number;
  assignedDriverId: string | null;
}

interface Driver {
  id: string;
  driverNumber: string;
  fullName: string;
  phone: string;
  licenseType: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  safetyScore: number;
  status: string;
  availabilityStatus: string;
}

interface Stats {
  total: number;
  active: number;
  maintenance: number;
  onRoute: number;
}

export default function FleetManagement() {
  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [vehicleStats, setVehicleStats] = useState<Stats>({ total: 0, active: 0, maintenance: 0, onRoute: 0 });
  const [driverStats, setDriverStats] = useState<any>({ total: 0, active: 0, available: 0, onDuty: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  
  // Search & Filter
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState({ status: 'all', type: 'all' });
  const [driverFilter, setDriverFilter] = useState({ status: 'all', availability: 'all' });
  const [showVehicleFilter, setShowVehicleFilter] = useState(false);
  const [showDriverFilter, setShowDriverFilter] = useState(false);
  
  // Modals
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'vehicle' | 'driver', id: string} | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchFleetData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, drivers, vehicleSearch, driverSearch, vehicleFilter, driverFilter]);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles from new standardized API
      const vehiclesRes = await fetch('/api/hq/fleet/vehicles');
      if (vehiclesRes.ok) {
        const result = await vehiclesRes.json();
        const vehiclesData = result.data?.vehicles || [];
        const stats = result.data?.stats || { total: 0, active: 0, maintenance: 0, onRoute: 0 };
        setVehicles(vehiclesData);
        setVehicleStats(stats);
        setFilteredVehicles(vehiclesData);
      }

      // Fetch drivers from new standardized API
      const driversRes = await fetch('/api/hq/fleet/drivers');
      if (driversRes.ok) {
        const result = await driversRes.json();
        const driversData = result.data?.drivers || [];
        setDrivers(driversData);
        setFilteredDrivers(driversData);
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredV = vehicles.filter(v => {
      const matchSearch = v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                         v.vehicleNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                         v.brand.toLowerCase().includes(vehicleSearch.toLowerCase());
      const matchStatus = vehicleFilter.status === 'all' || v.status === vehicleFilter.status;
      const matchType = vehicleFilter.type === 'all' || v.vehicleType === vehicleFilter.type;
      return matchSearch && matchStatus && matchType;
    });
    setFilteredVehicles(filteredV);

    let filteredD = drivers.filter(d => {
      const matchSearch = d.fullName.toLowerCase().includes(driverSearch.toLowerCase()) ||
                         d.driverNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
                         d.phone.includes(driverSearch);
      const matchStatus = driverFilter.status === 'all' || d.status === driverFilter.status;
      const matchAvailability = driverFilter.availability === 'all' || d.availabilityStatus === driverFilter.availability;
      return matchSearch && matchStatus && matchAvailability;
    });
    setFilteredDrivers(filteredD);
  };

  const handleExport = async (type: 'vehicles' | 'drivers') => {
    try {
      const response = await fetch('/api/fleet/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format: 'csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleet-${type}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const endpoint = deleteConfirm.type === 'vehicle' 
        ? `/api/fleet/vehicles/${deleteConfirm.id}`
        : `/api/fleet/drivers/${deleteConfirm.id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        setDeleteConfirm(null);
        fetchFleetData();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      truck: 'Truk',
      van: 'Van',
      motorcycle: 'Motor',
      car: 'Mobil'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800', label: 'Aktif', icon: CheckCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance', icon: Wrench },
      retired: { color: 'bg-gray-100 text-gray-800', label: 'Pensiun', icon: AlertCircle }
    };
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const getAvailabilityBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      available: { color: 'bg-green-100 text-green-800', label: 'Tersedia' },
      on_duty: { color: 'bg-blue-100 text-blue-800', label: 'Bertugas' },
      off_duty: { color: 'bg-gray-100 text-gray-800', label: 'Off Duty' }
    };
    const badge = badges[status] || badges.available;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const calculateOnTimeRate = (driver: Driver) => {
    if (driver.totalDeliveries === 0) return 0;
    return Math.round((driver.onTimeDeliveries / driver.totalDeliveries) * 100);
  };

  if (!mounted) return null;

  return (
    <HQLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Kelola kendaraan dan driver untuk operasional pengiriman</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kendaraan</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kendaraan Aktif</p>
                <p className="text-2xl font-bold text-green-600">{vehicleStats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Driver</p>
                <p className="text-2xl font-bold text-gray-900">{driverStats.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sedang Bertugas</p>
                <p className="text-2xl font-bold text-blue-600">{driverStats.onDuty}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'vehicles'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Kendaraan ({vehicleStats.total})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'drivers'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Driver ({driverStats.total})
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        placeholder="Cari kendaraan..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowVehicleFilter(!showVehicleFilter)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                      {showVehicleFilter && (
                        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={vehicleFilter.status}
                              onChange={(e) => setVehicleFilter(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">Semua</option>
                              <option value="active">Aktif</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="retired">Pensiun</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <select
                              value={vehicleFilter.type}
                              onChange={(e) => setVehicleFilter(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">Semua</option>
                              <option value="truck">Truk</option>
                              <option value="van">Van</option>
                              <option value="motorcycle">Motor</option>
                              <option value="car">Mobil</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleExport('vehicles')}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button 
                      onClick={fetchFleetData}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setSelectedVehicle(null); setShowVehicleForm(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Kendaraan
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Memuat data...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada kendaraan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Plat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Merk/Model</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Odometer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Service Berikutnya</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredVehicles.map((vehicle) => (
                          <tr key={vehicle.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/hq/fleet/vehicles/${vehicle.id}`}>
                            <td className="px-4 py-3">
                              <a href={`/hq/fleet/vehicles/${vehicle.id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {vehicle.licensePlate}
                              </a>
                              <div className="text-sm text-gray-500">{vehicle.vehicleNumber}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{getVehicleTypeLabel(vehicle.vehicleType)}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{vehicle.brand}</div>
                              <div className="text-xs text-gray-500">{vehicle.model}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{vehicle.currentOdometerKm.toLocaleString()} km</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{vehicle.nextServiceDueKm.toLocaleString()} km</span>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(vehicle.status)}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedVehicle(vehicle); setShowVehicleForm(true); }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'vehicle', id: vehicle.id }); }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Drivers Tab */}
            {activeTab === 'drivers' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={driverSearch}
                        onChange={(e) => setDriverSearch(e.target.value)}
                        placeholder="Cari driver..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowDriverFilter(!showDriverFilter)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                      {showDriverFilter && (
                        <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              value={driverFilter.status}
                              onChange={(e) => setDriverFilter(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">Semua</option>
                              <option value="active">Aktif</option>
                              <option value="on_leave">Cuti</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                            <select
                              value={driverFilter.availability}
                              onChange={(e) => setDriverFilter(prev => ({ ...prev, availability: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">Semua</option>
                              <option value="available">Tersedia</option>
                              <option value="on_duty">Bertugas</option>
                              <option value="off_duty">Off Duty</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleExport('drivers')}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button 
                      onClick={fetchFleetData}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setSelectedDriver(null); setShowDriverForm(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Driver
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Memuat data...</p>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada driver</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">No. SIM</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Telepon</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Pengiriman</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">On-Time Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Safety Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredDrivers.map((driver) => (
                          <tr key={driver.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/hq/fleet/drivers/${driver.id}`}>
                            <td className="px-4 py-3">
                              <a href={`/hq/fleet/drivers/${driver.id}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {driver.fullName}
                              </a>
                              <div className="text-sm text-gray-500">{driver.driverNumber}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{driver.licenseType}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{driver.phone}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{driver.totalDeliveries.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${calculateOnTimeRate(driver)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{calculateOnTimeRate(driver)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{driver.safetyScore}</span>
                            </td>
                            <td className="px-4 py-3">
                              {getAvailabilityBadge(driver.availabilityStatus)}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedDriver(driver); setShowDriverForm(true); }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'driver', id: driver.id }); }}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showVehicleForm && (
        <VehicleFormModal
          vehicle={selectedVehicle}
          onClose={() => { setShowVehicleForm(false); setSelectedVehicle(null); }}
          onSuccess={() => { fetchFleetData(); }}
        />
      )}

      {showDriverForm && (
        <DriverFormModal
          driver={selectedDriver}
          onClose={() => { setShowDriverForm(false); setSelectedDriver(null); }}
          onSuccess={() => { fetchFleetData(); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus {deleteConfirm.type === 'vehicle' ? 'kendaraan' : 'driver'} ini?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close filters */}
      {(showVehicleFilter || showDriverFilter) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => { setShowVehicleFilter(false); setShowDriverFilter(false); }}
        />
      )}
    </HQLayout>
  );
}
