import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { COMPANY_LEGAL_NAME } from './brand';

const nav = [
  { href: '#perusahaan', label: 'Perusahaan' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#harga', label: 'Harga' },
  { href: '#testimoni', label: 'Testimoni' },
];

const LandingHeader: React.FC = () => {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-40 transition-[box-shadow] duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 ${
        scrolled ? 'shadow-sm shadow-slate-900/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.25rem] flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex flex-col gap-0.5 shrink-0 group min-w-0"
          aria-label="BEDAGANG beranda"
        >
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity leading-none">
            BEDAGANG
          </span>
          <span className="hidden sm:block text-[10px] md:text-[11px] font-medium text-slate-500 truncate max-w-[10rem] md:max-w-[14rem] lg:max-w-none">
            {COMPANY_LEGAL_NAME}
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1 rounded-full px-1 py-1 bg-slate-900/5 border border-slate-900/5"
          aria-label="Navigasi utama"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-white/80 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/30 transition-shadow"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Masuk</span>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70 border border-transparent hover:border-slate-200/80 transition-colors"
              >
                <LogIn className="w-4 h-4" aria-hidden />
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-sm font-semibold px-4 py-2 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">Daftar gratis</span>
                <span className="sm:hidden">Daftar</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;
