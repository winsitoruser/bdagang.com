import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import { useTranslation } from '@/lib/i18n';
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

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', vehicleNumber: 'VH-001', licensePlate: 'B 1234 ABC', vehicleType: 'truck', brand: 'Mitsubishi', model: 'Colt Diesel FE 74', status: 'active', currentOdometerKm: 45200, nextServiceDueKm: 50000, assignedDriverId: 'dr1' },
  { id: 'v2', vehicleNumber: 'VH-002', licensePlate: 'B 5678 DEF', vehicleType: 'van', brand: 'Daihatsu', model: 'Gran Max Blind Van', status: 'active', currentOdometerKm: 32100, nextServiceDueKm: 40000, assignedDriverId: 'dr2' },
  { id: 'v3', vehicleNumber: 'VH-003', licensePlate: 'D 9012 GHI', vehicleType: 'truck', brand: 'Hino', model: 'Dutro 130 HD', status: 'maintenance', currentOdometerKm: 78500, nextServiceDueKm: 80000, assignedDriverId: null },
  { id: 'v4', vehicleNumber: 'VH-004', licensePlate: 'B 3456 JKL', vehicleType: 'motorcycle', brand: 'Honda', model: 'Vario 160', status: 'active', currentOdometerKm: 12300, nextServiceDueKm: 15000, assignedDriverId: 'dr4' },
  { id: 'v5', vehicleNumber: 'VH-005', licensePlate: 'L 7890 MNO', vehicleType: 'van', brand: 'Suzuki', model: 'APV Blind Van', status: 'active', currentOdometerKm: 28700, nextServiceDueKm: 30000, assignedDriverId: 'dr5' },
  { id: 'v6', vehicleNumber: 'VH-006', licensePlate: 'B 2345 PQR', vehicleType: 'car', brand: 'Toyota', model: 'Avanza', status: 'active', currentOdometerKm: 55600, nextServiceDueKm: 60000, assignedDriverId: null },
  { id: 'v7', vehicleNumber: 'VH-007', licensePlate: 'DK 6789 STU', vehicleType: 'motorcycle', brand: 'Yamaha', model: 'NMAX', status: 'active', currentOdometerKm: 8900, nextServiceDueKm: 10000, assignedDriverId: 'dr7' },
  { id: 'v8', vehicleNumber: 'VH-008', licensePlate: 'B 0123 VWX', vehicleType: 'truck', brand: 'Isuzu', model: 'Elf NLR 55', status: 'retired', currentOdometerKm: 120000, nextServiceDueKm: 125000, assignedDriverId: null },
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'dr1', driverNumber: 'DR-001', fullName: 'Agus Setiawan', phone: '081234560001', licenseType: 'B2', totalDeliveries: 342, onTimeDeliveries: 318, safetyScore: 92, status: 'active', availabilityStatus: 'on_duty' },
  { id: 'dr2', driverNumber: 'DR-002', fullName: 'Bambang Suryadi', phone: '081234560002', licenseType: 'B1', totalDeliveries: 256, onTimeDeliveries: 230, safetyScore: 88, status: 'active', availabilityStatus: 'on_duty' },
  { id: 'dr3', driverNumber: 'DR-003', fullName: 'Candra Wibowo', phone: '081234560003', licenseType: 'B2', totalDeliveries: 189, onTimeDeliveries: 170, safetyScore: 85, status: 'active', availabilityStatus: 'available' },
  { id: 'dr4', driverNumber: 'DR-004', fullName: 'Dedi Kurniawan', phone: '081234560004', licenseType: 'C', totalDeliveries: 520, onTimeDeliveries: 495, safetyScore: 95, status: 'active', availabilityStatus: 'on_duty' },
  { id: 'dr5', driverNumber: 'DR-005', fullName: 'Eka Pratama', phone: '081234560005', licenseType: 'B1', totalDeliveries: 178, onTimeDeliveries: 160, safetyScore: 90, status: 'active', availabilityStatus: 'available' },
  { id: 'dr6', driverNumber: 'DR-006', fullName: 'Faisal Rahman', phone: '081234560006', licenseType: 'B2', totalDeliveries: 95, onTimeDeliveries: 82, safetyScore: 78, status: 'inactive', availabilityStatus: 'off_duty' },
  { id: 'dr7', driverNumber: 'DR-007', fullName: 'Galih Permana', phone: '081234560007', licenseType: 'C', totalDeliveries: 410, onTimeDeliveries: 390, safetyScore: 93, status: 'active', availabilityStatus: 'on_duty' },
];

const MOCK_VEHICLE_STATS: Stats = { total: 8, active: 5, maintenance: 1, onRoute: 3 };
const MOCK_DRIVER_STATS = { total: 7, active: 6, available: 2, onDuty: 4 };

export default function FleetManagement() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicleStats, setVehicleStats] = useState<Stats>(MOCK_VEHICLE_STATS);
  const [driverStats, setDriverStats] = useState<any>(MOCK_DRIVER_STATS);
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
        const stats = result.data?.stats || MOCK_VEHICLE_STATS;
        setVehicles(vehiclesData.length > 0 ? vehiclesData : MOCK_VEHICLES);
        setVehicleStats(stats);
        setFilteredVehicles(vehiclesData.length > 0 ? vehiclesData : MOCK_VEHICLES);
      }

      // Fetch drivers from new standardized API
      const driversRes = await fetch('/api/hq/fleet/drivers');
      if (driversRes.ok) {
        const result = await driversRes.json();
        const driversData = result.data?.drivers || [];
        setDrivers(driversData.length > 0 ? driversData : MOCK_DRIVERS);
        setFilteredDrivers(driversData.length > 0 ? driversData : MOCK_DRIVERS);
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      setVehicles(MOCK_VEHICLES); setFilteredVehicles(MOCK_VEHICLES); setVehicleStats(MOCK_VEHICLE_STATS);
      setDrivers(MOCK_DRIVERS); setFilteredDrivers(MOCK_DRIVERS); setDriverStats(MOCK_DRIVER_STATS);
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
      truck: t('fleet.truck'),
      van: t('fleet.van'),
      motorcycle: t('fleet.motorcycle'),
      car: t('fleet.car')
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800', label: t('fleet.active'), icon: CheckCircle },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', label: t('fleet.maintenance'), icon: Wrench },
      retired: { color: 'bg-gray-100 text-gray-800', label: t('fleet.retired'), icon: AlertCircle }
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
      available: { color: 'bg-green-100 text-green-800', label: t('fleet.available') },
      on_duty: { color: 'bg-blue-100 text-blue-800', label: t('fleet.onDutyStatus') },
      off_duty: { color: 'bg-gray-100 text-gray-800', label: t('fleet.offDuty') }
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
          <h1 className="text-2xl font-bold text-gray-900">{t('fleet.title')}</h1>
          <p className="text-gray-600">{t('fleet.subtitle')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('fleet.totalVehicles')}</p>
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
                <p className="text-sm text-gray-600">{t('fleet.activeVehicles')}</p>
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
                <p className="text-sm text-gray-600">{t('fleet.totalDrivers')}</p>
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
                <p className="text-sm text-gray-600">{t('fleet.onDuty')}</p>
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
                  {t('fleet.vehiclesTab')} ({vehicleStats.total})
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
                  {t('fleet.driversTab')} ({driverStats.total})
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
                        placeholder={t('fleet.searchVehicle')}
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
                              <option value="all">{t('fleet.all')}</option>
                              <option value="active">{t('fleet.active')}</option>
                              <option value="maintenance">{t('fleet.maintenance')}</option>
                              <option value="retired">{t('fleet.retired')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <select
                              value={vehicleFilter.type}
                              onChange={(e) => setVehicleFilter(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">{t('fleet.all')}</option>
                              <option value="truck">{t('fleet.truck')}</option>
                              <option value="van">{t('fleet.van')}</option>
                              <option value="motorcycle">{t('fleet.motorcycle')}</option>
                              <option value="car">{t('fleet.car')}</option>
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
                      {t('fleet.export')}
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
                      {t('fleet.addVehicle')}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">{t('fleet.loading')}</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">{t('fleet.noVehicles')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.licensePlate')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.type')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.brandModel')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.odometer')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.nextService')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.status')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.actions')}</th>
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
                        placeholder={t('fleet.searchDriver')}
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
                              <option value="all">{t('fleet.all')}</option>
                              <option value="active">{t('fleet.active')}</option>
                              <option value="on_leave">{t('fleet.onLeave')}</option>
                              <option value="suspended">{t('fleet.suspended')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ketersediaan</label>
                            <select
                              value={driverFilter.availability}
                              onChange={(e) => setDriverFilter(prev => ({ ...prev, availability: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="all">{t('fleet.all')}</option>
                              <option value="available">{t('fleet.available')}</option>
                              <option value="on_duty">{t('fleet.onDutyStatus')}</option>
                              <option value="off_duty">{t('fleet.offDuty')}</option>
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
                      Ekspor
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
                      {t('fleet.addDriver')}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">{t('fleet.loading')}</p>
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">{t('fleet.noDrivers')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.name')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.licenseNumber')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.phone')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.totalDeliveries')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.onTimeRate')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.safetyScore')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.status')}</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('fleet.actions')}</th>
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t('fleet.deleteConfirmTitle')}</h3>
            <p className="text-gray-600 mb-6">
              {deleteConfirm.type === 'vehicle' ? t('fleet.deleteConfirmVehicle') : t('fleet.deleteConfirmDriver')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('fleet.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('fleet.delete')}
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
