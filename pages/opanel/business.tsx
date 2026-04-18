import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import OpanelLayout from '@/components/opanel/OpanelLayout';
import { OpanelDotPattern, OpanelRestoMark } from '@/components/opanel/OpanelDecorations';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Mail,
  MapPin,
  BadgeCheck,
} from 'lucide-react';

type TenantPayload = {
  id?: string;
  businessName?: string;
  setupCompleted?: boolean;
  businessType?: { name?: string; code?: string };
  businessEmail?: string;
  businessAddress?: string;
};

const OpanelBusiness: NextPage = () => {
  const [tenant, setTenant] = useState<TenantPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/tenant/info');
        const j = await r.json();
        if (r.ok && j.tenant) setTenant(j.tenant);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Profil bisnis | Panel pemilik | BEDAGANG</title>
      </Head>
      <OpanelLayout title="Profil bisnis">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-sm font-medium text-slate-600">Memuat data tenant…</p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50">
              <div className="pointer-events-none absolute inset-0">
                <OpanelDotPattern className="opacity-40" />
              </div>
              <div className="relative border-b border-slate-100 bg-gradient-to-br from-slate-900 via-violet-900 to-teal-900 px-8 py-10 text-white">
                <div className="pointer-events-none absolute right-6 top-6 opacity-10">
                  <OpanelRestoMark className="h-32 w-32" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-200">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Identitas bisnis
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight">{tenant?.businessName || 'Tenant'}</h2>
                {tenant?.businessType?.name && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                    <BadgeCheck className="h-4 w-4 text-teal-300" />
                    {tenant.businessType.name}
                  </p>
                )}
              </div>

              <div className="relative space-y-6 p-8">
                <div
                  className={`flex items-start gap-4 rounded-2xl border p-4 ${
                    tenant?.setupCompleted
                      ? 'border-emerald-200/80 bg-emerald-50/50'
                      : 'border-amber-200/80 bg-amber-50/50'
                  }`}
                >
                  {tenant?.setupCompleted ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">
                      {tenant?.setupCompleted ? 'Setup awal selesai' : 'Lengkapi onboarding'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {tenant?.setupCompleted
                        ? 'Tenant siap dipakai untuk operasional harian.'
                        : 'Selesaikan langkah onboarding agar semua modul berjalan optimal.'}
                    </p>
                  </div>
                </div>

                {(tenant?.businessEmail || tenant?.businessAddress) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tenant.businessEmail && (
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100">
                          <Mail className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</p>
                          <p className="truncate text-sm font-semibold text-slate-800">{tenant.businessEmail}</p>
                        </div>
                      </div>
                    )}
                    {tenant.businessAddress && (
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:col-span-2">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm ring-1 ring-slate-100">
                          <MapPin className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alamat</p>
                          <p className="text-sm font-medium leading-relaxed text-slate-800">{tenant.businessAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:from-slate-800 hover:to-slate-700"
                  >
                    Pengaturan tenant
                    <ExternalLink className="h-4 w-4 opacity-80" />
                  </Link>
                  {!tenant?.setupCompleted && (
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-400/60 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-100"
                    >
                      Lanjutkan onboarding
                    </Link>
                  )}
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p>
                    Pengaturan pajak, modul, dan integrasi dikelola dari menu pengaturan tenant — alur khusus untuk
                    pemilik tanpa bergantung pada panel HQ terpisah.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </OpanelLayout>
    </>
  );
};

export default OpanelBusiness;
