import type { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import OpanelLayout from '@/components/opanel/OpanelLayout';
import OpanelWorkforcePanel from '@/components/opanel/OpanelWorkforcePanel';
import type { OpanelWorkforceInsight } from '@/types/opanel-workforce';
import { Loader2, RefreshCw } from 'lucide-react';

const OpanelWorkforce: NextPage = () => {
  const [workforce, setWorkforce] = useState<OpanelWorkforceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/opanel/workforce');
      const j = await r.json();
      if (!r.ok || !j.success) {
        setErr(j.error || 'Gagal memuat data tim');
        setWorkforce(null);
      } else {
        setWorkforce((j.data as OpanelWorkforceInsight) || null);
      }
    } catch {
      setErr('Koneksi gagal');
      setWorkforce(null);
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
        <title>Tim & jadwal | Panel pemilik | BEDAGANG</title>
      </Head>
      <OpanelLayout title="Tim & jadwal">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-5">
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              Tabel di bawah memuat jadwal shift (WIB), petugas dalam slot aktif, agregasi per cabang, dan login akun
              tenant—langsung siap dibaca atau diekspor manual (screenshot / salin).
            </p>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-900 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Segarkan
            </button>
          </div>

          {err && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{err}</div>
          )}

          {loading && !workforce ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              Memuat…
            </div>
          ) : (
            <OpanelWorkforcePanel workforce={workforce} variant="page" />
          )}
        </div>
      </OpanelLayout>
    </>
  );
};

export default OpanelWorkforce;
