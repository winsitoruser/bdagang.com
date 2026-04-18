import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import OpanelLayout from '@/components/opanel/OpanelLayout';
import { OpanelDotPattern, OpanelRestoMark } from '@/components/opanel/OpanelDecorations';
import {
  Loader2,
  MapPin,
  Phone,
  Hash,
  Store,
  ChevronRight,
  Layers,
} from 'lucide-react';

type Branch = { id: string; name: string; code: string; type?: string; city?: string; phone?: string };

const OpanelOutlets: NextPage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/opanel/summary');
      const j = await r.json();
      if (r.ok && j.success) setBranches(j.branches || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Head>
        <title>Cabang & outlet | Panel pemilik | BEDAGANG</title>
      </Head>
      <OpanelLayout title="Cabang & outlet">
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-600 via-emerald-700 to-slate-900 p-8 text-white shadow-xl">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <OpanelDotPattern className="text-white" />
            </div>
            <div className="pointer-events-none absolute -right-4 bottom-0 opacity-10">
              <OpanelRestoMark className="h-40 w-40" />
            </div>
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/20 backdrop-blur">
                  <Layers className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-100">Jaringan outlet</p>
                  <p className="text-2xl font-bold">Semua cabang</p>
                  <p className="mt-1 text-sm text-teal-100/90">
                    {loading ? 'Memuat…' : `${branches.length} lokasi di bawah tenant Anda`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-sm font-medium text-slate-600">Memuat daftar cabang…</p>
            </div>
          ) : branches.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-8 py-16 text-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
                <Store className="h-48 w-48 text-slate-900" strokeWidth={1} />
              </div>
              <Store className="relative mx-auto h-12 w-12 text-slate-400" />
              <p className="relative mt-4 text-lg font-bold text-slate-800">Belum ada cabang</p>
              <p className="relative mx-auto mt-2 max-w-md text-sm text-slate-600">
                Data outlet akan muncul di sini setelah cabang didaftarkan untuk tenant ini.
              </p>
              <Link
                href="/settings"
                className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
              >
                Buka pengaturan
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {branches.map((b, i) => (
                <li
                  key={b.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-teal-200/80 hover:shadow-md"
                >
                  <div
                    className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-600"
                    style={{ opacity: 0.55 + (i % 3) * 0.12 }}
                  />
                  <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-teal-700 ring-1 ring-slate-200/80">
                        <Store className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-slate-900">{b.name}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                            <Hash className="h-3.5 w-3.5 text-teal-600" />
                            {b.code}
                          </span>
                          {b.type && (
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 capitalize text-violet-800">
                              {b.type}
                            </span>
                          )}
                          {b.city && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {b.city}
                            </span>
                          )}
                          {b.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {b.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/settings"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 transition group-hover:border-teal-300 group-hover:bg-teal-50 group-hover:text-teal-900"
                    >
                      Pengaturan
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </OpanelLayout>
    </>
  );
};

export default OpanelOutlets;
