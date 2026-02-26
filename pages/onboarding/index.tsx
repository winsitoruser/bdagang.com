import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Building2,
  Users,
  Package,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
}

export default function OnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Selamat Datang',
      description: 'Mari kita setup bisnis Anda',
      icon: Building2,
      completed: false
    },
    {
      id: 1,
      title: 'Informasi Bisnis',
      description: 'Lengkapi detail bisnis Anda',
      icon: Building2,
      completed: false
    },
    {
      id: 2,
      title: 'Setup Pengguna',
      description: 'Tambahkan tim Anda',
      icon: Users,
      completed: false
    },
    {
      id: 3,
      title: 'Produk & Inventori',
      description: 'Import atau tambahkan produk',
      icon: Package,
      completed: false
    },
    {
      id: 4,
      title: 'Pengaturan Sistem',
      description: 'Konfigurasi sistem sesuai kebutuhan',
      icon: Settings,
      completed: false
    }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      fetchTenantInfo();
    }
  }, [status, session]);

  const fetchTenantInfo = async () => {
    try {
      const response = await fetch('/api/tenant/info');
      if (response.ok) {
        const data = await response.json();
        setTenant(data.tenant);
        setCurrentStep(data.tenant.onboardingStep || 0);
      }
    } catch (error) {
      console.error('Error fetching tenant info:', error);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Update onboarding step
      await fetch('/api/tenant/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStep + 1 })
      });

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        await fetch('/api/tenant/onboarding/complete', {
          method: 'POST'
        });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await fetch('/api/tenant/onboarding/complete', {
        method: 'POST'
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const StepIcon = steps[currentStep].icon;

  return (
    <>
      <Head>
        <title>Setup Awal - Bedagang ERP</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Langkah {currentStep + 1} dari {steps.length}
              </p>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <StepIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <p className="text-lg text-gray-700">
                    Selamat datang di Bedagang ERP! 🎉
                  </p>
                  <p className="text-gray-600">
                    Kami akan membantu Anda setup sistem dalam beberapa langkah mudah.
                    Proses ini hanya memakan waktu sekitar 5-10 menit.
                  </p>
                  {tenant && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Bisnis:</strong> {tenant.businessName}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Tipe:</strong> {tenant.businessType?.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Pastikan informasi bisnis Anda sudah lengkap dan akurat.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama Bisnis:</span>
                      <span className="font-medium">{tenant?.businessName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{tenant?.businessEmail || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telepon:</span>
                      <span className="font-medium">{tenant?.businessPhone || '-'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Anda dapat mengubah informasi ini nanti di menu Pengaturan.
                  </p>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Tambahkan anggota tim Anda untuk mulai berkolaborasi.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tips:</strong> Anda dapat menambahkan pengguna nanti melalui menu
                      Manajemen Pengguna di dashboard.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Import produk Anda atau tambahkan secara manual.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                      <h3 className="font-semibold mb-2">Import CSV</h3>
                      <p className="text-sm text-gray-600">
                        Upload file CSV dengan daftar produk Anda
                      </p>
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors">
                      <h3 className="font-semibold mb-2">Tambah Manual</h3>
                      <p className="text-sm text-gray-600">
                        Tambahkan produk satu per satu
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Konfigurasi pengaturan sistem sesuai kebutuhan bisnis Anda.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Mata Uang</span>
                      <span className="font-medium">IDR (Rp)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Zona Waktu</span>
                      <span className="font-medium">WIB (GMT+7)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Format Tanggal</span>
                      <span className="font-medium">DD/MM/YYYY</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Setup hampir selesai! Klik "Selesai" untuk mulai menggunakan sistem.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Kembali
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  Lewati Setup
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    'Memproses...'
                  ) : currentStep === steps.length - 1 ? (
                    <>
                      Selesai
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Lanjut
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
