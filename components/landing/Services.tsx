import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Clock,
  Shield,
} from 'lucide-react';
import { COMPANY_LEGAL_NAME } from './brand';

const Services: React.FC = () => {
  const router = useRouter();
  const services = [
    {
      icon: ShoppingCart,
      title: 'Cloud POS & kasir',
      description:
        'Antrian transaksi yang stabil untuk restoran sibuk maupun toko ritel. UI ringkas, training singkat, dan sinkronisasi antar perangkat secara real time.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Package,
      title: 'Inventori & SKU',
      description:
        'Peta stok per outlet atau gudang, peringatan minimum stok, dan mutasi barang yang jejaknya jelas — cocok untuk retail multi-SKU dan bahan baku F&B.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'Pelanggan & loyalitas',
      description:
        'Database pelanggan, tier member, dan promo terarah untuk meningkatkan kunjungan ulang — dari kafe neighborhood hingga jaringan ritel.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Laporan & analitik',
      description:
        'Dashboard ringkas untuk owner: penjualan per kanal, jam sibuk, performa menu/produk, dan KPI yang bisa dijadikan dasar keputusan harian.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Multi-outlet & pusat data',
      description:
        'Satu tenant SaaS untuk banyak lokasi: standar harga, stok, dan user role terpusat, dengan visibilitas per cabang agar ekspansi terkontrol.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: FileText,
      title: 'Pembayaran & keuangan',
      description:
        'Menerima tunai, kartu, QRIS, dan dompet digital dalam satu alur closing. Mendukung rekonsiliasi harian untuk tim finance profesional.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Clock,
      title: 'Tim, shift & hak akses',
      description:
        'Shift kasir, izin per modul, dan audit aktivitas — membantu restoran dengan rotasi staf tinggi maupun retail dengan banyak kasir.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: Shield,
      title: 'Keamanan & backup cloud',
      description:
        'Infrastruktur cloud dengan praktik keamanan modern, cadangan data, dan ketersediaan layanan yang kami kelola sebagai penyedia SaaS.',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      id="fitur"
      className="relative scroll-mt-24 py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.35]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.45) 1px, transparent 0)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-50/60 to-transparent" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800">
            Modul produk SaaS
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Dirancang untuk
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-700">
              {' '}
              operasional nyata
            </span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-slate-600 leading-relaxed">
            Tim produk dan layanan <strong className="font-semibold text-slate-800">{COMPANY_LEGAL_NAME}</strong>{' '}
            membangun BEDAGANG agar tim di lapangan — dari dapur restoran hingga gudang retail — punya
            alur kerja yang konsisten dan terukur.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative bg-white/90 rounded-2xl p-6 border border-slate-200/80 shadow-sm shadow-slate-900/5 hover:shadow-xl hover:border-sky-200/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>

                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 p-10 md:p-12 shadow-2xl shadow-slate-900/25">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" aria-hidden />
            <h3 className="relative text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Siap go-live dengan tim kami
            </h3>
            <p className="relative text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Mulai dari trial mandiri hingga pendampingan onboarding: kami membantu Anda menerapkan
              SaaS POS BEDAGANG sesuai alur F&amp;B atau retail Anda — tanpa biaya setup tersembunyi
              untuk paket standar.
            </p>
            <motion.button
              type="button"
              onClick={() => router.push('/auth/register')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Mulai trial 14 hari
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
