import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  Shield,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Lock,
  Unlock,
  Eye,
  CheckCircle,
  XCircle,
  Settings,
  Key
} from 'lucide-react';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  level: number;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

const mockRoles: Role[] = [
  {
    id: '1',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Akses penuh ke semua fitur sistem',
    level: 1,
    permissions: [
      { id: '1', module: 'all', action: 'all', description: 'Full Access' }
    ],
    userCount: 2,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    code: 'HQ_ADMIN',
    name: 'HQ Admin',
    description: 'Admin level HQ untuk manajemen cabang',
    level: 2,
    permissions: [
      { id: '2', module: 'branches', action: 'all', description: 'Manage Branches' },
      { id: '3', module: 'products', action: 'all', description: 'Manage Products' },
      { id: '4', module: 'users', action: 'read', description: 'View Users' },
      { id: '5', module: 'reports', action: 'all', description: 'View Reports' }
    ],
    userCount: 5,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    code: 'BRANCH_MANAGER',
    name: 'Manager Cabang',
    description: 'Manajer dengan akses penuh ke cabangnya',
    level: 3,
    permissions: [
      { id: '6', module: 'branch', action: 'all', description: 'Manage Own Branch' },
      { id: '7', module: 'pos', action: 'all', description: 'POS Operations' },
      { id: '8', module: 'employees', action: 'all', description: 'Manage Employees' },
      { id: '9', module: 'reports', action: 'read', description: 'View Reports' }
    ],
    userCount: 8,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    code: 'SUPERVISOR',
    name: 'Supervisor',
    description: 'Supervisor dengan akses terbatas',
    level: 4,
    permissions: [
      { id: '10', module: 'pos', action: 'all', description: 'POS Operations' },
      { id: '11', module: 'employees', action: 'read', description: 'View Employees' },
      { id: '12', module: 'void', action: 'approve', description: 'Approve Void' }
    ],
    userCount: 12,
    isSystem: false,
    isActive: true,
    createdAt: '2024-02-15'
  },
  {
    id: '5',
    code: 'CASHIER',
    name: 'Kasir',
    description: 'Staff kasir dengan akses POS saja',
    level: 5,
    permissions: [
      { id: '13', module: 'pos', action: 'create', description: 'Create Transaction' },
      { id: '14', module: 'pos', action: 'read', description: 'View Transaction' }
    ],
    userCount: 45,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '6',
    code: 'WAREHOUSE',
    name: 'Staff Gudang',
    description: 'Staff gudang untuk manajemen stok',
    level: 5,
    permissions: [
      { id: '15', module: 'inventory', action: 'all', description: 'Manage Inventory' },
      { id: '16', module: 'receiving', action: 'all', description: 'Receive Goods' }
    ],
    userCount: 8,
    isSystem: false,
    isActive: true,
    createdAt: '2024-03-01'
  }
];

const allPermissions = [
  { module: 'branches', actions: ['read', 'create', 'update', 'delete'] },
  { module: 'products', actions: ['read', 'create', 'update', 'delete', 'price_lock'] },
  { module: 'users', actions: ['read', 'create', 'update', 'delete', 'role_assign'] },
  { module: 'pos', actions: ['read', 'create', 'void', 'refund', 'discount'] },
  { module: 'inventory', actions: ['read', 'create', 'update', 'transfer', 'adjust'] },
  { module: 'reports', actions: ['read', 'export'] },
  { module: 'settings', actions: ['read', 'update'] }
];

export default function UserRoles() {
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    level: 5,
    selectedPermissions: [] as string[]
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/roles');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setRoles(payload.roles || mockRoles);
      } else {
        setRoles(mockRoles);
      }
    } catch (error) {
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRoles();
  }, []);

  if (!mounted) {
    return null;
  }

  const handleCreate = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newRole: Role = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase().replace(/\s+/g, '_'),
      name: formData.name,
      description: formData.description,
      level: formData.level,
      permissions: [],
      userCount: 0,
      isSystem: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setRoles(prev => [...prev, newRole]);
    setSaving(false);
    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!selectedRole || selectedRole.isSystem) return;
    setRoles(prev => prev.filter(r => r.id !== selectedRole.id));
    setShowDeleteConfirm(false);
    setSelectedRole(null);
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', description: '', level: 5, selectedPermissions: [] });
  };

  const getLevelBadge = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-purple-100 text-purple-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<number, string> = {
      1: 'Super Admin',
      2: 'Admin',
      3: 'Manager',
      4: 'Supervisor',
      5: 'Staff'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors[5]}`}>
        Level {level} - {labels[level] || 'Staff'}
      </span>
    );
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: roles.length,
    system: roles.filter(r => r.isSystem).length,
    custom: roles.filter(r => !r.isSystem).length,
    totalUsers: roles.reduce((sum, r) => sum + r.userCount, 0)
  };

  return (
    <HQLayout title="Manajemen Role" subtitle="Kelola role dan hak akses pengguna">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Role</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.system}</p>
                <p className="text-sm text-gray-500">System Role</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.custom}</p>
                <p className="text-sm text-gray-500">Custom Role</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">Total User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchRoles}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Role
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Level</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Permission</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">User</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Tipe</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{role.name}</p>
                            <p className="text-sm text-gray-500 font-mono">{role.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getLevelBadge(role.level)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {role.permissions.length} permissions
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{role.userCount}</td>
                      <td className="py-3 px-4 text-center">
                        {role.isSystem ? (
                          <span className="flex items-center justify-center gap-1 text-purple-600">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">System</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-green-600">
                            <Unlock className="w-3 h-3" />
                            <span className="text-xs">Custom</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={role.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setFormData({
                                code: role.code,
                                name: role.name,
                                description: role.description,
                                level: role.level,
                                selectedPermissions: role.permissions.map(p => `${p.module}:${p.action}`)
                              });
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            disabled={role.isSystem}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRole(role);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            disabled={role.isSystem || role.userCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={selectedRole?.name || 'Detail Role'}
          subtitle={selectedRole?.code}
          size="lg"
        >
          {selectedRole && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getLevelBadge(selectedRole.level)}
                {selectedRole.isSystem && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    <Lock className="w-3 h-3" />
                    System Role
                  </span>
                )}
                <StatusBadge status={selectedRole.isActive ? 'active' : 'inactive'} />
              </div>
              <p className="text-gray-600">{selectedRole.description}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Permissions ({selectedRole.permissions.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRole.permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{perm.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                <span>{selectedRole.userCount} user dengan role ini</span>
                <span>Dibuat: {new Date(selectedRole.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          )}
        </Modal>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => { setShowCreateModal(false); setShowEditModal(false); }}
          title={showCreateModal ? 'Tambah Role Baru' : 'Edit Role'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Role</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ROLE_CODE"
                  disabled={showEditModal}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama Role"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Akses</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>Level 2 - Admin</option>
                <option value={3}>Level 3 - Manager</option>
                <option value={4}>Level 4 - Supervisor</option>
                <option value={5}>Level 5 - Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                {allPermissions.map((perm) => (
                  <div key={perm.module}>
                    <p className="text-sm font-medium text-gray-700 capitalize mb-1">{perm.module}</p>
                    <div className="flex flex-wrap gap-2">
                      {perm.actions.map((action) => {
                        const key = `${perm.module}:${action}`;
                        const isSelected = formData.selectedPermissions.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedPermissions: isSelected
                                  ? prev.selectedPermissions.filter(p => p !== key)
                                  : [...prev.selectedPermissions, key]
                              }));
                            }}
                            className={`px-2 py-1 rounded text-xs ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !formData.name || !formData.code}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Hapus Role"
          message={`Apakah Anda yakin ingin menghapus role "${selectedRole?.name}"? Role sistem tidak dapat dihapus.`}
          confirmText="Hapus"
          variant="danger"
        />
      </div>
    </HQLayout>
  );
}
