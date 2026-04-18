import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useRouter } from 'next/router';
import { COMPANY_LEGAL_NAME } from './brand';

const Pricing: React.FC = () => {
  const router = useRouter();

  const plans = [
    {
      name: 'Starter',
      price: 'Gratis',
      period: 'Selamanya',
      description: 'Cocok untuk UMKM satu lokasi yang ingin digitalisasi bertahap',
      features: [
        '1 outlet',
        'Transaksi tanpa batas (fair use)',
        'POS dasar & cetak struk',
        'Inventori & katalog produk',
        'Laporan penjualan harian',
        'Basis data pelanggan',
        'Backup cloud',
        'Dukungan email',
      ],
      cta: 'Aktifkan Starter',
      popular: false,
    },
    {
      name: 'Professional',
      price: 'Rp 299K',
      period: '/bulan',
      description: 'Untuk restoran berkembang & retail multi-shift yang butuh insight lebih',
      features: [
        'Hingga 3 outlet',
        'Transaksi tanpa batas (fair use)',
        'POS lanjutan & promosi',
        'Inventori & mutasi stok',
        'Analitik & dasbor manajemen',
        'Program loyalitas & member',
        'Manajemen karyawan & shift',
        'Integrasi kanal pembayaran',
        'Prioritas dukungan',
        'Desain struk sesuai brand',
      ],
      cta: 'Trial Professional 14 hari',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Hubungi kami',
      description: 'Grup F&B, ritel nasional, atau integrasi khusus — kami rancang bersama',
      features: [
        'Outlet tanpa batas (sesuai kontrak)',
        'Volume transaksi enterprise',
        'Seluruh modul & SLA dedicated',
        'Multi-gudang & distribusi',
        'API & integrasi sistem korporat',
        'Pengembangan fitur khusus',
        'Account manager berdedikasi',
        'Opsi hybrid / on-premise (diskusi)',
        'Dukungan prioritas 24/7',
        'Pelatihan & change management',
      ],
      cta: 'Diskusi dengan tim kami',
      popular: false,
    },
  ];

  const handleCTA = (planName: string) => {
    if (planName === 'Enterprise') {
      // Open contact form or redirect to contact page
      window.location.href = 'mailto:sales@bedagang.com';
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <section id="harga" className="relative scroll-mt-24 py-24 bg-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Langganan SaaS
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Investasi jelas,
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              {' '}
              tanpa tebak-tebakan
            </span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-slate-600 leading-relaxed">
            Model berlangganan BEDAGANG disusun agar restoran, kafe, dan ritel bisa memilih tier yang
            selaras dengan jumlah outlet dan kompleksitas operasi — dengan bimbingan tim{' '}
            {COMPANY_LEGAL_NAME}.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:shadow-xl transition-all duration-300 ${
                plan.popular
                  ? 'ring-2 ring-sky-500 border-sky-200/80 md:scale-[1.02] z-[1]'
                  : 'hover:border-slate-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Paling Populer</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'Hubungi kami' && (
                    <span className="text-slate-600 ml-2">{plan.period}</span>
                  )}
                </div>
                {plan.period === 'Hubungi kami' && (
                  <p className="text-slate-600 text-sm">{plan.period}</p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                type="button"
                onClick={() => handleCTA(plan.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-full font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/25 hover:shadow-lg'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200/90'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Paket berbayar umumnya mencakup trial 14 hari. Detail kontrak enterprise akan disepakati
            langsung dengan perwakilan {COMPANY_LEGAL_NAME}.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
