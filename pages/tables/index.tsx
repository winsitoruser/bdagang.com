import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { 
  FaPlus, FaEdit, FaTrash, FaChair, FaCheckCircle, 
  FaTimesCircle, FaTools, FaFilter, FaTable, FaCog
} from 'react-icons/fa';
import { MdTableRestaurant } from 'react-icons/md';

interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  area: string;
  floor: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  notes?: string;
  currentSession?: any;
  currentReservation?: any;
}

const TablesPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 2,
    area: 'indoor',
    floor: 1,
    notes: ''
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchTables();
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [tables, filterStatus, filterArea, filterFloor]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      
      if (data.success) {
        setTables(data.data);
      } else {
        console.error('Failed to fetch tables:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tables];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    
    if (filterArea !== 'all') {
      filtered = filtered.filter(t => t.area === filterArea);
    }
    
    if (filterFloor !== 'all') {
      filtered = filtered.filter(t => t.floor === parseInt(filterFloor));
    }
    
    setFilteredTables(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables';
      const method = editingTable ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingTable ? 'Table updated successfully!' : 'Table created successfully!');
        setShowModal(false);
        resetForm();
        fetchTables();
      } else {
        alert(data.error || 'Failed to save table');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      alert('An error occurred while saving the table');
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      area: table.area,
      floor: table.floor,
      notes: table.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Are you sure you want to delete table ${table.tableNumber}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Table deleted successfully!');
        fetchTables();
      } else {
        alert(data.error || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('An error occurred while deleting the table');
    }
  };

  const handleStatusChange = async (table: Table, newStatus: string) => {
    try {
      const response = await fetch(`/api/tables/${table.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchTables();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating status');
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      capacity: 2,
      area: 'indoor',
      floor: 1,
      notes: ''
    });
    setEditingTable(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-300';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'maintenance': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <FaCheckCircle className="w-4 h-4" />;
      case 'occupied': return <FaChair className="w-4 h-4" />;
      case 'reserved': return <FaTimesCircle className="w-4 h-4" />;
      case 'maintenance': return <FaTools className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'occupied': return 'bg-gradient-to-br from-red-500 to-red-600';
      case 'reserved': return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
      case 'maintenance': return 'bg-gradient-to-br from-gray-500 to-gray-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const summary = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Loading tables...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Table Management - Bedagang</title>
      </Head>

      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaTable className="text-sky-600" />
              Table Management
            </h1>
            <p className="text-gray-600 mt-2">Manage restaurant tables and seating arrangements</p>
          </div>
          <button
            onClick={() => router.push('/tables/settings')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaCog />
            Pengaturan
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-sky-500">
            <div className="text-sm text-gray-600">Total Tables</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Available</div>
            <div className="text-2xl font-bold text-green-600">{summary.available}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600">Occupied</div>
            <div className="text-2xl font-bold text-red-600">{summary.occupied}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600">Reserved</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.reserved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <div className="text-sm text-gray-600">Maintenance</div>
            <div className="text-2xl font-bold text-gray-600">{summary.maintenance}</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Areas</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="vip">VIP</option>
              <option value="smoking">Smoking</option>
              <option value="non-smoking">Non-Smoking</option>
            </select>

            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>

            <div className="ml-auto">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                Add Table
              </button>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading tables...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaTable className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No tables found</p>
            <p className="text-gray-500 mt-2">Add your first table to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className={`bg-white rounded-lg shadow-md border-2 ${getStatusColor(table.status)} p-4 hover:shadow-lg transition-all hover:-translate-y-1`}
              >
                {/* Table Icon Header */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getStatusBgColor(table.status)} shadow-lg`}>
                    <MdTableRestaurant className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 text-center">
                    <h3 className="text-xl font-bold text-gray-900">{table.tableNumber}</h3>
                    <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <FaChair className="w-3 h-3" />
                      {table.capacity} persons
                    </p>
                  </div>
                  <div className="flex items-center gap-1 absolute top-4 right-4">
                    {getStatusIcon(table.status)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium capitalize">{table.area}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{table.floor}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{table.status}</span>
                  </div>
                </div>

                {table.notes && (
                  <p className="text-xs text-gray-500 mb-3 italic">{table.notes}</p>
                )}

                {/* Quick Status Actions */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleStatusChange(table, 'available')}
                    disabled={table.status === 'available'}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleStatusChange(table, 'occupied')}
                    disabled={table.status === 'occupied'}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => handleStatusChange(table, 'reserved')}
                    disabled={table.status === 'reserved'}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => handleStatusChange(table, 'maintenance')}
                    disabled={table.status === 'maintenance'}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Maintenance
                  </button>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(table)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(table)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Table Number</label>
                    <input
                      type="text"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="T-01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Area</label>
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData({...formData, area: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="vip">VIP</option>
                      <option value="smoking">Smoking</option>
                      <option value="non-smoking">Non-Smoking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Floor</label>
                    <input
                      type="number"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="e.g., Near window, corner table..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    {editingTable ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function TablesPageWithGuard() {
  return (
    <ModuleGuard moduleCode="tables">
      <TablesPage />
    </ModuleGuard>
  );
}
