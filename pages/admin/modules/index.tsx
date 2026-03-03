import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  sortOrder: number;
  isCore: boolean;
  isActive: boolean;
  stats: {
    enabledTenants: number;
  };
  businessTypeModules: Array<{
    businessType: {
      id: string;
      code: string;
      name: string;
    };
    isDefault: boolean;
    isOptional: boolean;
  }>;
}

export default function ModulesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    const userRole = (session?.user?.role as string)?.toLowerCase();
    if (session && !['admin', 'super_admin', 'superadmin'].includes(userRole)) {
      router.push('/admin/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchModules();
    }
  }, [status, session, router]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/modules');
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }

      const data = await response.json();
      setModules(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessTypesBadges = (businessTypeModules: any[]) => {
    if (!businessTypeModules || businessTypeModules.length === 0) {
      return <span className="text-xs text-gray-400">No business types</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {businessTypeModules.map((btm) => (
          <span
            key={btm.businessType.id}
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              btm.isDefault
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {btm.businessType.name}
            {btm.isOptional && ' (Optional)'}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat modul...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Manajemen Modul - Panel Admin</title>
      </Head>

      <AdminLayout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Modul</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola modul sistem dan penugasan
              </p>
            </div>
            <Link
              href="/admin/modules/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Buat Modul
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modul</p>
                <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modul Inti</p>
                <p className="text-2xl font-bold text-gray-900">
                  {modules.filter(m => m.isCore).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modul Opsional</p>
                <p className="text-2xl font-bold text-gray-900">
                  {modules.filter(m => !m.isCore).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Modul Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {modules.filter(m => m.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    module.isActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Package className={`w-6 h-6 ${
                      module.isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-xs text-gray-500">{module.code}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {module.isCore && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Inti
                    </span>
                  )}
                  {module.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {module.description || 'Tidak ada deskripsi'}
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Jenis Bisnis:</p>
                {getBusinessTypesBadges(module.businessTypeModules)}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {module.stats?.enabledTenants || 0} penyewa
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert('Fitur edit modul akan segera hadir')}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ubah"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {module.route && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Route: <code className="bg-gray-100 px-1 py-0.5 rounded">{module.route}</code>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new module.
            </p>
          </div>
        )}
      </div>
      </AdminLayout>
    </>
  );
}
