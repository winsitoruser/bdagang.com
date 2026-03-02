import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  Building2,
  UserCheck,
  UserX,
  Key,
  Lock,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'BRANCH_MANAGER' | 'CASHIER' | 'STAFF';
  branchId: string | null;
  branchName: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  avatar: string | null;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  BRANCH_MANAGER: 'bg-green-100 text-green-800',
  CASHIER: 'bg-yellow-100 text-yellow-800',
  STAFF: 'bg-gray-100 text-gray-800'
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  BRANCH_MANAGER: 'Branch Manager',
  CASHIER: 'Kasir',
  STAFF: 'Staff'
};

export default function UserManagement() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF' as User['role'],
    branchId: '',
    password: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/users?page=${page}&limit=${pageSize}`);
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        if (payload.users) setUsers(payload.users);
        if (payload.total) setTotal(payload.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, [page, pageSize]);

  if (!mounted) {
    return null;
  }

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/hq/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowEditModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/users/${selectedUser.id}`, { method: 'DELETE' });
      if (response.ok) {
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/users/${selectedUser.id}/toggle-active`, { method: 'POST' });
      if (response.ok) {
        setShowToggleConfirm(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/hq/users/${selectedUser.id}/reset-password`, { method: 'POST' });
      if (response.ok) {
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        alert('Email reset password telah dikirim');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STAFF',
      branchId: '',
      password: ''
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getTimeSince = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah login';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Pengguna',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[value]}`}>
          {roleLabels[value]}
        </span>
      )
    },
    {
      key: 'branchName',
      header: 'Cabang',
      render: (_, user) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4" />
          <span>{user.branchName || 'Semua Cabang'}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'lastLogin',
      header: 'Login Terakhir',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {getTimeSince(value)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'center',
      width: '150px',
      render: (_, user) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowViewModal(true); }}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(user); }}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowResetPasswordModal(true); }}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowToggleConfirm(true); }}
            className={`p-2 rounded-lg ${user.isActive ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}
            title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
          {user.role !== 'SUPER_ADMIN' && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowDeleteConfirm(true); }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="text-gray-500">Kelola akun pengguna dan hak akses</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pengguna</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admin</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Branch Manager</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'BRANCH_MANAGER').length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nonaktif</p>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchPlaceholder="Cari pengguna..."
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize
          }}
          actions={{
            onRefresh: fetchUsers
          }}
          onRowClick={(user) => { setSelectedUser(user); setShowViewModal(true); }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
        title={showCreateModal ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={showCreateModal ? handleCreate : handleUpdate}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="081234567890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="STAFF">Staff</option>
                <option value="CASHIER">Kasir</option>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={formData.role === 'ADMIN'}
              >
                <option value="">Semua Cabang</option>
                <option value="1">Cabang Pusat Jakarta</option>
                <option value="2">Cabang Bandung</option>
                <option value="3">Cabang Surabaya</option>
              </select>
            </div>
          </div>
          {showCreateModal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedUser(null); }}
        title="Detail Pengguna"
        size="md"
        footer={
          <div className="flex justify-between">
            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Tutup
            </button>
            <button
              onClick={() => { setShowViewModal(false); openEditModal(selectedUser!); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '-'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser?.name}</h3>
                <p className="text-gray-500">{selectedUser?.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[selectedUser?.role] || ''}`}>
                    {roleLabels[selectedUser?.role] || '-'}
                  </span>
                  <StatusBadge status={selectedUser?.isActive ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{selectedUser?.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Cabang</p>
                  <p className="font-medium">{selectedUser?.branchName || 'Semua Cabang'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Login Terakhir</p>
                  <p className="font-medium">{formatDate(selectedUser?.lastLogin)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowViewModal(false); setShowResetPasswordModal(true); }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                <Key className="w-4 h-4" />
                Reset Password
              </button>
              <button
                onClick={() => { setShowViewModal(false); setShowToggleConfirm(true); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  selectedUser?.isActive ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                {selectedUser?.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {selectedUser?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
        onConfirm={handleDelete}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${selectedUser?.name}"?`}
        confirmText="Hapus"
        variant="danger"
        loading={actionLoading}
      />

      {/* Toggle Active Confirm */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => { setShowToggleConfirm(false); setSelectedUser(null); }}
        onConfirm={handleToggleActive}
        title={selectedUser?.isActive ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
        message={selectedUser?.isActive 
          ? `Apakah Anda yakin ingin menonaktifkan pengguna "${selectedUser?.name}"? Pengguna tidak akan dapat login.`
          : `Apakah Anda yakin ingin mengaktifkan kembali pengguna "${selectedUser?.name}"?`
        }
        confirmText={selectedUser?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        variant={selectedUser?.isActive ? 'warning' : 'info'}
        loading={actionLoading}
      />

      {/* Reset Password Confirm */}
      <ConfirmDialog
        isOpen={showResetPasswordModal}
        onClose={() => { setShowResetPasswordModal(false); setSelectedUser(null); }}
        onConfirm={handleResetPassword}
        title="Reset Password"
        message={`Kirim email reset password ke "${selectedUser?.email}"?`}
        confirmText="Kirim Email"
        variant="info"
        loading={actionLoading}
      />
    </HQLayout>
  );
}
