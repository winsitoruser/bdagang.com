import React from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ArrowRight, Sparkles, BarChart3, Receipt, Building2 } from 'lucide-react';
import { COMPANY_LEGAL_NAME, HERO_BADGE } from './brand';

const Hero: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-[4.25rem]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/95 to-sky-800"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-90 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.35),transparent)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-sky-500/25 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-[22rem] h-[22rem] rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] rounded-full bg-cyan-400/15 blur-3xl"
          animate={{ y: [0, 24, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="inline-flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left shadow-lg shadow-sky-900/20 backdrop-blur-md max-w-xl mx-auto lg:mx-0"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" aria-hidden />
                BEDAGANG
              </span>
              <span className="hidden sm:block h-4 w-px bg-white/20 shrink-0" aria-hidden />
              <span className="text-xs sm:text-sm font-medium text-sky-100/95 leading-snug">
                {HERO_BADGE}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="mt-8 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
                Business POS &amp; operasional
              </span>
              <br />
              <span className="text-slate-100">untuk restoran, kafe, dan retail</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Solusi <strong className="font-semibold text-white">SaaS berlangganan</strong> dari{' '}
              <strong className="font-semibold text-white">{COMPANY_LEGAL_NAME}</strong> — kelola
              transaksi, stok, pelanggan, dan laporan dalam satu platform yang aman dan siap tumbuh
              bersama bisnis Anda.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch sm:items-center"
            >
              <motion.button
                type="button"
                onClick={handleGetStarted}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-8 py-4 text-base font-semibold shadow-xl shadow-sky-900/25 hover:shadow-2xl hover:shadow-sky-900/30 transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{session ? 'Buka dashboard' : 'Masuk ke platform'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" aria-hidden />
              </motion.button>

              {!session && (
                <motion.button
                  type="button"
                  onClick={() => router.push('/auth/register')}
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Aktivasi trial 14 hari
                </motion.button>
              )}
              <a
                href="#fitur"
                className="hidden sm:inline-flex items-center justify-center text-sm font-semibold text-sky-200/90 hover:text-white transition-colors py-2 px-2"
              >
                Lihat modul fitur
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.36 }}
              className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0"
            >
              {[
                { number: 'F&B · Retail', label: 'Segmen utama kami' },
                { number: '99.9%', label: 'Target SLA infrastruktur' },
                { number: '24/7', label: 'Dukungan teknis' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-left backdrop-blur-md"
                >
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.number}</div>
                  <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-slate-400"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden />
              <span>
                {COMPANY_LEGAL_NAME} — penyedia software layanan (SaaS) dan implementasi POS
                profesional.
              </span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5"
            aria-hidden
          >
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-white/10 to-indigo-500/20 blur-2xl" />
              <div className="relative rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-200/80">
                      Ringkasan outlet
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">Rp 24,8 jt</p>
                    <p className="text-sm text-emerald-300/90">+12,4% vs kemarin</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                    <BarChart3 className="w-7 h-7 text-sky-200" />
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100 border border-white/10">
                    Restoran
                  </span>
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100 border border-white/10">
                    Retail
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Transaksi hari ini</p>
                    <p className="mt-1 text-lg font-semibold text-white">186</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">SKU perlu restock</p>
                    <p className="mt-1 text-lg font-semibold text-amber-200">3</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Receipt className="w-5 h-5 text-sky-200 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">Pembayaran &amp; struk</p>
                    <p className="text-xs text-slate-400 truncate">
                      QRIS · kartu · tunai · split bill · park bill
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 pt-2">
          <motion.span
            className="block h-1.5 w-1.5 rounded-full bg-white/80"
            animate={{ y: [0, 10, 0], opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
