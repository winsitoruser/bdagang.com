import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/** URL legacy `/hq/dashboard` — arahkan ke beranda HQ (bukan panel pemilik). */
export default function HqDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hq/home');
  }, [router]);
  return (
    <>
      <Head>
        <title>Mengalihkan… | BEDAGANG</title>
      </Head>
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 bg-gray-50 text-gray-600">
        <p className="text-sm">Mengalihkan ke beranda HQ…</p>
      </div>
    </>
  );
}
