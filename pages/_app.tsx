import '../styles/global.scss';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { BusinessTypeProvider } from '@/contexts/BusinessTypeContext';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <BusinessTypeProvider>
        <Component {...pageProps} />
        <Toaster />
      </BusinessTypeProvider>
    </SessionProvider>
  );
}

export default MyApp;
