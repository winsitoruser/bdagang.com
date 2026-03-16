import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useTranslation } from '@/lib/i18n';
import { ModuleGuard } from '@/components/guards/ModuleGuard';
import { 
  FaPlus, FaEdit, FaTrash, FaCalendar, FaCheck, 
  FaTimes, FaUser, FaPhone, FaEnvelope, FaClock,
  FaChair, FaFilter, FaSearch
} from 'react-icons/fa';

interface Reservation {
  id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableNumber?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  specialRequests?: string;
  depositAmount?: number;
  table?: any;
  customer?: any;
}

const ReservationsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [allTables, setAllTables] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    reservationDate: '',
    reservationTime: '',
    guestCount: 2,
    tableId: '',
    specialRequests: '',
    depositAmount: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchReservations();
      fetchAllTables();
      fetchCustomers();
    }
  }, [session]);

  const fetchAllTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      
      if (data.success) {
        setAllTables(data.data.filter((t: any) => t.isActive));
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [reservations, filterStatus, filterDate, searchQuery]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      
      if (data.success) {
        setReservations(data.data);
      } else {
        console.error('Failed to fetch reservations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.reservationDate || !formData.guestCount) return;
    
    try {
      const params = new URLSearchParams({
        date: formData.reservationDate,
        time: formData.reservationTime || '00:00',
        guestCount: formData.guestCount.toString()
      });
      
      const response = await fetch(`/api/reservations/availability?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableTables(data.data.availableTables);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  useEffect(() => {
    if (formData.reservationDate && formData.guestCount) {
      checkAvailability();
    }
  }, [formData.reservationDate, formData.guestCount, formData.reservationTime]);

  const applyFilters = () => {
    let filtered = [...reservations];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    if (filterDate) {
      filtered = filtered.filter(r => r.reservationDate === filterDate);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.customerName.toLowerCase().includes(query) ||
        r.customerPhone.includes(query) ||
        r.reservationNumber.toLowerCase().includes(query)
      );
    }
    
    setFilteredReservations(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingReservation ? `/api/reservations/${editingReservation.id}` : '/api/reservations';
      const method = editingReservation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingReservation ? 'Reservation updated!' : `Reservation created: ${data.data.reservationNumber}`);
        setShowModal(false);
        resetForm();
        fetchReservations();
      } else {
        alert(data.error || 'Failed to save reservation');
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('An error occurred while saving the reservation');
    }
  };

  const handleStatusChange = async (reservation: Reservation, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchReservations();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating status');
    }
  };

  const handleDelete = async (reservation: Reservation) => {
    if (!confirm(`Cancel reservation ${reservation.reservationNumber}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Reservation cancelled successfully!');
        fetchReservations();
      } else {
        alert(data.error || 'Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('An error occurred while cancelling the reservation');
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      customerEmail: reservation.customerEmail || '',
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime,
      guestCount: reservation.guestCount,
      tableId: reservation.table?.id || '',
      specialRequests: reservation.specialRequests || '',
      depositAmount: reservation.depositAmount || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      reservationDate: '',
      reservationTime: '',
      guestCount: 2,
      tableId: '',
      specialRequests: '',
      depositAmount: 0
    });
    setEditingReservation(null);
    setAvailableTables([]);
    setCustomerMode('new');
    setSelectedCustomerId('');
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          customerName: customer.name || '',
          customerPhone: customer.phone || '',
          customerEmail: customer.email || ''
        });
      }
    } else {
      setFormData({
        ...formData,
        customerName: '',
        customerPhone: '',
        customerEmail: ''
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'seated': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const summary = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    completed: reservations.filter(r => r.status === 'completed').length
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Loading reservations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Reservation Management - Bedagang</title>
      </Head>

      <div className="px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaCalendar className="text-sky-600" />
            Reservation Management
          </h1>
          <p className="text-gray-600 mt-2">Manage customer reservations and bookings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-sky-500">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-blue-600">{summary.confirmed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Seated</div>
            <div className="text-2xl font-bold text-green-600">{summary.seated}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-gray-600">{summary.completed}</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or number..."
                className="border rounded px-3 py-2 w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border rounded px-3 py-2"
            />

            <div className="ml-auto">
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus />
                New Reservation
              </button>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading reservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No reservations found</p>
            <p className="text-gray-500 mt-2">Create your first reservation to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className={`bg-white rounded-lg shadow-md border-2 ${getStatusColor(reservation.status)} p-4`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{reservation.reservationNumber}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">{reservation.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span>{reservation.customerPhone}</span>
                      </div>
                      {reservation.customerEmail && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          <span>{reservation.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span>{new Date(reservation.reservationDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        <span>{reservation.reservationTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span>{reservation.guestCount} guests</span>
                      </div>
                      {reservation.tableNumber && (
                        <div className="flex items-center gap-2">
                          <FaChair className="text-gray-400" />
                          <span>Table {reservation.tableNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reservation.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(reservation, 'confirmed')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FaCheck /> Confirm
                      </button>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(reservation, 'seated')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FaChair /> Seat
                      </button>
                    )}
                    {reservation.status === 'seated' && (
                      <button
                        onClick={() => handleStatusChange(reservation, 'completed')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FaCheck /> Complete
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(reservation.status) && (
                      <>
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(reservation)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Special Requests:</span> {reservation.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-4">
                {editingReservation ? 'Edit Reservation' : 'New Reservation'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Mode Toggle */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Customer Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="customerMode"
                          value="new"
                          checked={customerMode === 'new'}
                          onChange={() => {
                            setCustomerMode('new');
                            setSelectedCustomerId('');
                            setFormData({...formData, customerName: '', customerPhone: '', customerEmail: ''});
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Walk-in / New Customer</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="customerMode"
                          value="existing"
                          checked={customerMode === 'existing'}
                          onChange={() => setCustomerMode('existing')}
                          className="mr-2"
                        />
                        <span className="text-sm">Existing Customer</span>
                      </label>
                    </div>
                  </div>

                  {/* Existing Customer Dropdown */}
                  {customerMode === 'existing' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Select Customer *</label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required={customerMode === 'existing'}
                      >
                        <option value="">-- Select a customer --</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                            {customer.email && ` (${customer.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={customerMode === 'existing' && selectedCustomerId !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={customerMode === 'existing' && selectedCustomerId !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      disabled={customerMode === 'existing' && selectedCustomerId !== ''}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Guest Count *</label>
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) => setFormData({...formData, reservationDate: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Time *</label>
                    <input
                      type="time"
                      value={formData.reservationTime}
                      onChange={(e) => setFormData({...formData, reservationTime: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Table Assignment
                      {availableTables.length > 0 && (
                        <span className="text-green-600 ml-2">({availableTables.length} available for selected date/time)</span>
                      )}
                      {formData.reservationDate && formData.guestCount && availableTables.length === 0 && (
                        <span className="text-yellow-600 ml-2">(Checking availability...)</span>
                      )}
                    </label>
                    <select
                      value={formData.tableId}
                      onChange={(e) => setFormData({...formData, tableId: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">No table assigned (will auto-assign)</option>
                      {availableTables.length > 0 ? (
                        // Show available tables for selected date/time
                        availableTables.map((table) => (
                          <option key={table.id} value={table.id}>
                            Table {table.tableNumber} - Cap: {table.capacity} | {table.area} | Floor {table.floor}
                          </option>
                        ))
                      ) : (
                        // Show all active tables as fallback
                        allTables.map((table) => (
                          <option key={table.id} value={table.id}>
                            Table {table.tableNumber} - Cap: {table.capacity} | {table.area} | Floor {table.floor}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableTables.length > 0 
                        ? 'Showing tables available for your selected date and time'
                        : 'Select date and guest count to see available tables'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Deposit Amount</label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData({...formData, depositAmount: parseFloat(e.target.value)})}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="e.g., Window seat, birthday celebration..."
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
                    {editingReservation ? 'Update' : 'Create'} Reservation
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

export default function ReservationsPageWithGuard() {
  return (
    <ModuleGuard moduleCode="reservations">
      <ReservationsPage />
    </ModuleGuard>
  );
}
