import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { OpanelRestoMark } from '@/components/opanel/OpanelDecorations';

export default function OPanelIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/opanel/dashboard');
  }, [router]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-teal-500/15" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
          <OpanelRestoMark className="h-9 w-9 text-amber-400" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
        Mengalihkan ke dasbor pemilik…
      </div>
    </div>
  );
}
