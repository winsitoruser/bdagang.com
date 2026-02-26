// Module Edit Page
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Save,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Package,
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
  isCore: boolean;
  isActive: boolean;
  tenantCount: number;
  businessTypes: Array<{
    id: string;
    code: string;
    name: string;
    BusinessTypeModule: {
      isDefault: boolean;
      isOptional: boolean;
    };
  }>;
}

interface BusinessType {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isOptional: boolean;
}

export default function ModuleEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [module, setModule] = useState<Module | null>(null);
  const [allBusinessTypes, setAllBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    route: '',
    isActive: true
  });

  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<Map<string, { isDefault: boolean; isOptional: boolean }>>(new Map());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    const userRole = (session?.user?.role as string)?.toLowerCase();
    if (session && !['admin', 'super_admin', 'superadmin'].includes(userRole)) {
      router.push('/admin/login');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchModule();
      fetchBusinessTypes();
    }
  }, [status, session, router, id]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/modules/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }

      const data = await response.json();
      setModule(data.data);

      // Set form data
      setFormData({
        name: data.data.name,
        description: data.data.description || '',
        icon: data.data.icon || '',
        route: data.data.route || '',
        isActive: data.data.isActive
      });

      // Set selected business types
      const btMap = new Map();
      data.data.businessTypes?.forEach((bt: any) => {
        btMap.set(bt.id, {
          isDefault: bt.BusinessTypeModule.isDefault,
          isOptional: bt.BusinessTypeModule.isOptional
        });
      });
      setSelectedBusinessTypes(btMap);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/admin/business-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch business types');
      }

      const data = await response.json();
      setAllBusinessTypes(data.data || []);
    } catch (err: any) {
      console.error('Error fetching business types:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare business types data
      const businessTypes = Array.from(selectedBusinessTypes.entries()).map(([btId, config]) => ({
        businessTypeId: btId,
        isDefault: config.isDefault,
        isOptional: config.isOptional
      }));

      const response = await fetch(`/api/admin/modules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          businessTypes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update module');
      }

      setSuccess('Module updated successfully!');
      setTimeout(() => {
        router.push('/admin/modules');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/modules/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete module');
      }

      setSuccess('Module deleted successfully!');
      setTimeout(() => {
        router.push('/admin/modules');
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleBusinessType = (btId: string) => {
    const newMap = new Map(selectedBusinessTypes);
    if (newMap.has(btId)) {
      newMap.delete(btId);
    } else {
      newMap.set(btId, { isDefault: true, isOptional: false });
    }
    setSelectedBusinessTypes(newMap);
  };

  const updateBusinessTypeConfig = (btId: string, field: 'isDefault' | 'isOptional', value: boolean) => {
    const newMap = new Map(selectedBusinessTypes);
    const current = newMap.get(btId);
    if (current) {
      newMap.set(btId, { ...current, [field]: value });
      setSelectedBusinessTypes(newMap);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading module...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !module) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-gray-600">Error: {error}</p>
            <button
              onClick={() => router.push('/admin/modules')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Module - {module?.name} - Bedagang Admin</title>
      </Head>

      <AdminLayout>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/modules')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Module</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update module configuration and business type associations
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Module Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Code
                    </label>
                    <input
                      type="text"
                      value={module?.code || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Code cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="e.g., Package"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route
                      </label>
                      <input
                        type="text"
                        value={formData.route}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        placeholder="e.g., /products"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Module is active
                    </label>
                  </div>
                </div>
              </div>

              {/* Business Type Associations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Type Associations</h2>
                
                <div className="space-y-3">
                  {allBusinessTypes.map((bt) => {
                    const isSelected = selectedBusinessTypes.has(bt.id);
                    const config = selectedBusinessTypes.get(bt.id);

                    return (
                      <div key={bt.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id={`bt-${bt.id}`}
                            checked={isSelected}
                            onChange={() => toggleBusinessType(bt.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div className="ml-3 flex-1">
                            <label htmlFor={`bt-${bt.id}`} className="block text-sm font-medium text-gray-900">
                              {bt.name}
                            </label>
                            <p className="text-xs text-gray-500">{bt.code}</p>

                            {isSelected && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`default-${bt.id}`}
                                    checked={config?.isDefault || false}
                                    onChange={(e) => updateBusinessTypeConfig(bt.id, 'isDefault', e.target.checked)}
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`default-${bt.id}`} className="ml-2 text-xs text-gray-600">
                                    Default module
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`optional-${bt.id}`}
                                    checked={config?.isOptional || false}
                                    onChange={(e) => updateBusinessTypeConfig(bt.id, 'isOptional', e.target.checked)}
                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`optional-${bt.id}`} className="ml-2 text-xs text-gray-600">
                                    Optional module
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Module Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Module Stats</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Tenants Using</p>
                    <p className="text-2xl font-bold text-gray-900">{module?.tenantCount || 0}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Module Type</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      module?.isCore ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {module?.isCore ? 'Core Module' : 'Optional Module'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      module?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {module?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>

                  {!module?.isCore && session?.user?.role === 'super_admin' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || (module?.tenantCount || 0) > 0}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{deleting ? 'Deleting...' : 'Delete Module'}</span>
                    </button>
                  )}

                  {(module?.tenantCount || 0) > 0 && (
                    <p className="text-xs text-gray-500 text-center">
                      Cannot delete: Module is used by {module?.tenantCount} tenant(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
