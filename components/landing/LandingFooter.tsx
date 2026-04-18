import React from 'react';
import Link from 'next/link';
import { COMPANY_LEGAL_NAME, PRODUCT_LINE } from './brand';

const LandingFooter: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-200/90 bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" aria-hidden />
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          <div className="max-w-lg">
            <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              BEDAGANG
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{COMPANY_LEGAL_NAME}</p>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">{PRODUCT_LINE}</p>
            <p className="mt-4 text-slate-500 text-sm leading-relaxed">
              Kami menyediakan perangkat lunak berlangganan (SaaS), implementasi POS, dan dukungan
              berkelanjutan agar operasional klien tetap andal dari hari pertama go-live.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm min-w-0 lg:min-w-[28rem]">
            <div>
              <p className="font-semibold text-slate-900 mb-3">Produk</p>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a href="#perusahaan" className="hover:text-sky-600 transition-colors">
                    Perusahaan &amp; segmen
                  </a>
                </li>
                <li>
                  <a href="#fitur" className="hover:text-sky-600 transition-colors">
                    Modul fitur
                  </a>
                </li>
                <li>
                  <a href="#harga" className="hover:text-sky-600 transition-colors">
                    Harga
                  </a>
                </li>
                <li>
                  <a href="#testimoni" className="hover:text-sky-600 transition-colors">
                    Testimoni
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-3">Akun</p>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link href="/auth/login" className="hover:text-sky-600 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-sky-600 transition-colors">
                    Daftar / trial
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-semibold text-slate-900 mb-3">Bisnis</p>
              <p className="text-slate-600">
                <a
                  href="mailto:sales@bedagang.com?subject=Diskusi%20BEDAGANG%20SaaS%20POS"
                  className="hover:text-sky-600 transition-colors break-all"
                >
                  sales@bedagang.com
                </a>
              </p>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Untuk proposal enterprise atau integrasi khusus, tim {COMPANY_LEGAL_NAME} akan
                menghubungi Anda setelah email diterima.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} BEDAGANG — {COMPANY_LEGAL_NAME}. Hak cipta dilindungi
            undang-undang.
          </p>
          <p className="sm:text-right">Indonesia · SaaS Business POS · F&amp;B &amp; retail</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
