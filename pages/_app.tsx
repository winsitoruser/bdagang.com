import '../styles/global.scss';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { BusinessTypeProvider } from '@/contexts/BusinessTypeContext';
import { FinancePeriodProvider } from '@/contexts/FinancePeriodContext';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import { appTranslations } from '@/lib/translations/app';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <TranslationProvider translations={appTranslations}>
        <BusinessTypeProvider>
          <FinancePeriodProvider>
            <Component {...pageProps} />
            <Toaster />
          </FinancePeriodProvider>
        </BusinessTypeProvider>
      </TranslationProvider>
    </SessionProvider>
  );
}

export default MyApp;
