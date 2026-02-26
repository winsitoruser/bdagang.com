import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Package,
  TrendingUp,
  Building2,
  CheckCircle
} from 'lucide-react';

interface BusinessType {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  stats: {
    totalTenants: number;
    defaultModulesCount: number;
    optionalModulesCount: number;
    totalModulesCount: number;
  };
  businessTypeModules: Array<{
    isDefault: boolean;
    isOptional: boolean;
    module: {
      id: string;
      code: string;
      name: string;
      icon: string;
    };
  }>;
}

export default function BusinessTypesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session && !['SUPER_ADMIN', 'super_admin'].includes(session.user?.role as string)) {
      router.push('/admin/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchBusinessTypes();
    }
  }, [status, session, router]);

  const fetchBusinessTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/business-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch business types');
      }

      const data = await response.json();
      setBusinessTypes(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessTypeIcon = (code: string) => {
    const icons: any = {
      'retail': '🛒',
      'fnb': '🍽️',
      'hybrid': '🏪'
    };
    return icons[code] || '📦';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat jenis bisnis...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Jenis Bisnis - Panel Admin</title>
      </Head>

      <AdminLayout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jenis Bisnis</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kelola jenis bisnis dan modul mereka
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Jumlah Jenis Bisnis</p>
                <p className="text-2xl font-bold text-gray-900">{businessTypes.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Penyewa</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessTypes.reduce((sum, bt) => sum + bt.stats.totalTenants, 0)}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Modul Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {businessTypes.reduce((sum, bt) => sum + bt.stats.totalModulesCount, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Types Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {businessTypes.map((businessType) => (
            <div key={businessType.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{getBusinessTypeIcon(businessType.code)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{businessType.name}</h3>
                      <p className="text-sm text-gray-500">{businessType.code}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {businessType.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Penyewa</p>
                    <p className="text-xl font-bold text-blue-600">{businessType.stats.totalTenants}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Modul</p>
                    <p className="text-xl font-bold text-green-600">{businessType.stats.totalModulesCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Modul Default</span>
                    <span className="font-semibold text-gray-900">{businessType.stats.defaultModulesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Modul Opsional</span>
                    <span className="font-semibold text-gray-900">{businessType.stats.optionalModulesCount}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Modul Default:</p>
                  <div className="flex flex-wrap gap-1">
                    {businessType.businessTypeModules
                      .filter(btm => btm.isDefault)
                      .slice(0, 5)
                      .map((btm) => (
                        <span
                          key={btm.module.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {btm.module.name}
                        </span>
                      ))}
                    {businessType.businessTypeModules.filter(btm => btm.isDefault).length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{businessType.businessTypeModules.filter(btm => btm.isDefault).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {businessTypes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No business types found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Business types will appear here.
            </p>
          </div>
        )}
      </div>
      </AdminLayout>
    </>
  );
}
