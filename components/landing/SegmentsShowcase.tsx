import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Store, Cloud, Headphones } from 'lucide-react';
import { COMPANY_LEGAL_NAME, PRODUCT_LINE } from './brand';

const segments = [
  {
    icon: UtensilsCrossed,
    title: 'Restoran & F&B',
    subtitle: 'Meja, dapur, dan pembayaran dalam satu alur',
    bullets: [
      'POS cepat untuk rush hour & split bill',
      'Struktur menu, modifier, dan paket bundling',
      'Integrasi pembayaran QRIS, kartu, & e-wallet',
    ],
    accent: 'from-amber-500/20 to-orange-600/10 border-amber-500/30',
    iconBg: 'from-amber-500 to-orange-600',
  },
  {
    icon: Store,
    title: 'Retail & ritel',
    subtitle: 'Stok, cabang, dan promosi terkendali',
    bullets: [
      'SKU, varian, dan inventori multi-lokasi',
      'Promo, member, dan laporan penjualan real-time',
      'Skalakan dari satu toko hingga jaringan outlet',
    ],
    accent: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
    iconBg: 'from-sky-500 to-blue-600',
  },
] as const;

const SegmentsShowcase: React.FC = () => {
  return (
    <section
      id="perusahaan"
      className="relative z-20 scroll-mt-24 border-t border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 md:py-24 overflow-hidden"
      aria-labelledby="segments-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden
      />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,48rem)] h-32 bg-gradient-to-b from-sky-500/15 to-transparent blur-2xl" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-16"
        >
          <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sky-200/90">
            <Cloud className="w-3.5 h-3.5 text-sky-300 shrink-0" aria-hidden />
            {COMPANY_LEGAL_NAME}
          </p>
          <h2
            id="segments-heading"
            className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            Platform SaaS &amp;{' '}
            <span className="bg-gradient-to-r from-sky-200 to-cyan-200 bg-clip-text text-transparent">
              layanan POS bisnis
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">{PRODUCT_LINE}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Headphones className="w-4 h-4 text-sky-300" aria-hidden />
              Implementasi &amp; dukungan profesional
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {segments.map((seg, i) => {
            const Icon = seg.icon;
            return (
              <motion.article
                key={seg.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative rounded-3xl border bg-gradient-to-br p-8 md:p-10 ${seg.accent} backdrop-blur-sm`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${seg.iconBg} shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{seg.title}</h3>
                    <p className="mt-1 text-sm md:text-base text-slate-300">{seg.subtitle}</p>
                  </div>
                </div>
                <ul className="mt-8 space-y-3 text-sm md:text-[15px] text-slate-200 leading-relaxed">
                  {seg.bullets.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SegmentsShowcase;
