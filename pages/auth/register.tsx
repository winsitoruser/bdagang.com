import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building2, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle, Store, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    password: '',
    confirmPassword: '',
  });

  const businessTypes = [
    { value: 'fnb', label: 'F&B / Restoran', icon: '�️', desc: 'Kafe, restoran, warung makan, catering' },
    { value: 'retail', label: 'Retail / Toko', icon: '�', desc: 'Toko ritel, minimarket, kelontong' },
    { value: 'fashion', label: 'Fashion & Apparel', icon: '👔', desc: 'Pakaian, sepatu, aksesoris, butik' },
    { value: 'beauty', label: 'Beauty & Salon', icon: '💄', desc: 'Salon, spa, barbershop, klinik kecantikan' },
    { value: 'grocery', label: 'Grocery / Supermarket', icon: '🛒', desc: 'Supermarket, toko bahan pokok' },
    { value: 'pharmacy', label: 'Apotek / Farmasi', icon: '💊', desc: 'Apotek, toko obat, distributor farmasi' },
    { value: 'electronics', label: 'Elektronik', icon: '📱', desc: 'Toko elektronik, gadget, servis' },
    { value: 'automotive', label: 'Otomotif', icon: '🚗', desc: 'Bengkel, dealer, sparepart, car wash' },
    { value: 'services', label: 'Jasa / Layanan', icon: '🔧', desc: 'Konsultan, laundry, jasa profesional' },
    { value: 'other', label: 'Lainnya', icon: '📦', desc: 'Jenis bisnis lainnya' },
  ];

  const steps = [
    { number: 1, title: 'Info Pribadi', description: 'Data diri Anda' },
    { number: 2, title: 'Info Bisnis', description: 'Detail bisnis Anda' },
    { number: 3, title: 'Keamanan', description: 'Buat password' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Nama lengkap wajib diisi';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Nama minimal 3 karakter';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email wajib diisi';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format email tidak valid';
      }
    }

    if (step === 2) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Nama bisnis wajib diisi';
      }
      if (!formData.businessType) {
        newErrors.businessType = 'Pilih jenis bisnis Anda';
      }
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password wajib diisi';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password minimal 6 karakter';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          businessType: formData.businessType,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Registrasi berhasil! Mengalihkan ke onboarding...', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
          },
        });
        // Auto-login after registration
        const loginResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (loginResult?.ok) {
          router.push('/onboarding');
        } else {
          router.push('/auth/login');
        }
      } else {
        toast.error(data.message || 'Registrasi gagal. Silakan coba lagi.', {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Lemah', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Sedang', color: 'bg-yellow-500' };
    return { strength, label: 'Kuat', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Head>
        <title>Daftar Gratis - BEDAGANG Cloud POS</title>
        <meta name="description" content="Daftar gratis dan mulai kelola bisnis Anda dengan BEDAGANG. Tanpa biaya setup, tanpa kontrak." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 py-12">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-5xl">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            {/* Left Side - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 space-y-6"
            >
              {/* Logo */}
              <Link href="/" className="inline-block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
                    BEDAGANG
                  </h1>
                </motion.div>
              </Link>

              {/* Welcome Text */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Mulai Gratis<br />Hari Ini! 🚀
                </h2>
                <p className="text-lg text-gray-600">
                  Bergabunglah dengan <span className="font-semibold text-sky-600">10,000+</span> bisnis yang telah berkembang bersama BEDAGANG
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                {[
                  'Gratis selamanya untuk paket Starter',
                  'Setup dalam 5 menit',
                  'Tidak perlu kartu kredit',
                  'Support 24/7 siap membantu',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-sky-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Dipercaya oleh</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-sky-600">10K+</div>
                    <div className="text-xs text-gray-600">Bisnis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-600">1M+</div>
                    <div className="text-xs text-gray-600">Transaksi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-600">4.9/5</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    {steps.map((step, index) => (
                      <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center flex-1">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: currentStep === step.number ? 1.1 : 1,
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-all ${
                              currentStep > step.number
                                ? 'bg-green-500 text-white'
                                : currentStep === step.number
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {currentStep > step.number ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              step.number
                            )}
                          </motion.div>
                          <div className="text-center">
                            <div className={`text-xs font-medium ${
                              currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.title}
                            </div>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                            currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Form Steps */}
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Informasi Pribadi</h3>
                          <p className="text-gray-600">Mulai dengan data diri Anda</p>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition ${
                                errors.name ? 'border-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Contoh: John Doe"
                            />
                          </div>
                          {errors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.name}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition ${
                                errors.email ? 'border-red-500' : 'border-gray-200'
                              }`}
                              placeholder="john@example.com"
                            />
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.email}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            No. Telepon <span className="text-gray-400 text-xs">(Opsional)</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                              placeholder="08123456789"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Business Info */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Informasi Bisnis</h3>
                          <p className="text-gray-600">Ceritakan tentang bisnis Anda</p>
                        </div>

                        {/* Business Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Bisnis <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleChange}
                              className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition ${
                                errors.businessName ? 'border-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Contoh: Toko Berkah Jaya"
                            />
                          </div>
                          {errors.businessName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.businessName}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Business Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Jenis Bisnis <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {businessTypes.map((type) => (
                              <motion.button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, businessType: type.value });
                                  if (errors.businessType) {
                                    setErrors({ ...errors, businessType: '' });
                                  }
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${
                                  formData.businessType === type.value
                                    ? 'border-sky-500 bg-sky-50 shadow-md'
                                    : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start space-x-2">
                                  <span className="text-xl">{type.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 text-xs">{type.label}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">{type.desc}</div>
                                  </div>
                                  {formData.businessType === type.value && (
                                    <CheckCircle className="w-4 h-4 text-sky-600 flex-shrink-0" />
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                          {errors.businessType && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.businessType}</span>
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Security */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Keamanan Akun</h3>
                          <p className="text-gray-600">Buat password yang kuat untuk akun Anda</p>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition ${
                                errors.password ? 'border-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Minimal 6 karakter"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {formData.password && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Kekuatan password:</span>
                                <span className={`text-xs font-medium ${
                                  passwordStrength.strength <= 2 ? 'text-red-600' :
                                  passwordStrength.strength <= 3 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                  className={`h-2 rounded-full ${passwordStrength.color}`}
                                />
                              </div>
                            </div>
                          )}
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.password}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konfirmasi Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Ulangi password Anda"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-green-600 flex items-center space-x-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Password cocok</span>
                            </motion.p>
                          )}
                          {errors.confirmPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600 flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.confirmPassword}</span>
                            </motion.p>
                          )}
                        </div>

                        {/* Terms */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-600">
                            Dengan mendaftar, Anda menyetujui{' '}
                            <Link href="/terms" className="text-sky-600 hover:underline">
                              Syarat & Ketentuan
                            </Link>{' '}
                            dan{' '}
                            <Link href="/privacy" className="text-sky-600 hover:underline">
                              Kebijakan Privasi
                            </Link>{' '}
                            kami.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-between space-x-4">
                    {currentStep > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Kembali</span>
                      </motion.button>
                    )}

                    {currentStep < 3 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <span>Lanjutkan</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Mendaftar...</span>
                          </>
                        ) : (
                          <>
                            <span>Daftar Gratis</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Sudah punya akun?{' '}
                    <Link href="/auth/login" className="text-sky-600 font-semibold hover:text-sky-700 hover:underline">
                      Login di sini
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
