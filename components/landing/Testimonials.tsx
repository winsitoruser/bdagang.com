import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { COMPANY_LEGAL_NAME, PRODUCT_LINE } from './brand';

const AUTO_MS = 5200;

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Pemilik · Kopi Kenangan Senja',
      image: '👨‍💼',
      rating: 5,
      text: 'POS stabil di jam sibuk, split bill jelas, laporan harian siap tanpa tunggu closing manual.',
      business: 'F&B',
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Store Manager · Fashion Elegan',
      image: '👩‍💼',
      rating: 5,
      text: 'Stok antar cabang konsisten; promosi member terukur setelah pakai satu platform cloud.',
      business: 'Retail',
    },
    {
      name: 'Ahmad Rizki',
      role: 'Pemilik · Minimarket Berkah',
      image: '👨‍💻',
      rating: 5,
      text: 'Kasir dan stok dalam satu SaaS; dukungan teknis menjawab dengan konteks ritel nyata.',
      business: 'Minimarket',
    },
  ];

  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + testimonials.length) % testimonials.length);
    },
    [testimonials.length]
  );

  useEffect(() => {
    const t = setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(t);
  }, [go]);

  const t = testimonials[index];

  return (
    <section
      id="testimoni"
      className="relative scroll-mt-24 py-20 md:py-24 bg-gradient-to-b from-white via-slate-50/80 to-white overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-gradient-to-r from-sky-100/20 via-transparent to-blue-100/20 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-800">
            Testimoni
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Suara pengguna{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">
              ringkas
            </span>
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Tiga cerita singkat — ilustrasi tipikal {PRODUCT_LINE} dari {COMPANY_LEGAL_NAME}.
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex justify-center gap-2 mb-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-8 bg-sky-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Testimoni ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>

          <div className="min-h-[200px] md:min-h-[190px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-slate-200/90 bg-white/95 px-6 py-7 md:px-8 shadow-md shadow-slate-900/[0.04]"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <Quote className="w-7 h-7 text-sky-500/70 shrink-0" aria-hidden />
                  <div className="flex gap-0.5" aria-label={`${t.rating} dari 5 bintang`}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 text-base md:text-lg leading-relaxed">
                  &ldquo;{t.text.replace('{COMPANY_LEGAL_NAME}', COMPANY_LEGAL_NAME)}&rdquo;
                </p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.28 }}
                  className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-lg border border-slate-200/80"
                    aria-hidden
                  >
                    {t.image}
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-slate-900">{t.name}</h4>
                    <p className="text-sm text-slate-600">{t.role}</p>
                    <p className="text-xs text-sky-700 font-medium mt-0.5">{t.business}</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-colors"
              aria-label="Testimoni sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-colors"
              aria-label="Testimoni berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Ganti otomatis · tap titik atau panah
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
