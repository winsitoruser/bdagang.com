import React from 'react';
import Link from 'next/link';
import HQLayout from '../../../../components/hq/HQLayout';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <HQLayout title="Pembayaran Gagal">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XCircle className="w-9 h-9 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h2>
        <p className="text-gray-500 mb-6">Pembayaran tidak dapat diproses. Silakan coba lagi atau hubungi tim support kami.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hq/billing-info/plans" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4" /> Coba Lagi
          </Link>
          <Link href="/hq/billing-info" className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-200">
            Kembali ke Billing
          </Link>
        </div>
      </div>
    </HQLayout>
  );
}
