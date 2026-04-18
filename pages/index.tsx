// Bedagang Landing Page with Burger Menu - Modern Retail Platform
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Import custom components
import BurgerMenu from '../components/landing/BurgerMenu';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import SegmentsShowcase from '../components/landing/SegmentsShowcase';
import { COMPANY_LEGAL_NAME, PRODUCT_LINE } from '../components/landing/brand';

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Remove auto-redirect to allow users to see homepage with proper buttons
  // Users can manually click "Buka Dashboard" to access their dashboard

  // Handle logout success message
  useEffect(() => {
    if (router.query.logout === 'success') {
      toast.success('Anda berhasil logout', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: '500',
          fontSize: '14px',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        },
        icon: '✓',
      });
      
      // Clean up URL parameter
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query.logout, router]);

  // Simulate loading effect for smoother animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>
          BEDAGANG — SaaS Business POS untuk F&amp;B &amp; Retail | {COMPANY_LEGAL_NAME}
        </title>
        <meta
          name="description"
          content={`BEDAGANG adalah platform SaaS dan layanan POS bisnis dari ${COMPANY_LEGAL_NAME} untuk restoran, kafe, F&B, hingga ritel modern. ${PRODUCT_LINE}. Trial 14 hari.`}
        />
        <meta
          name="keywords"
          content="BEDAGANG, PT Naincode Inti Technology, SaaS POS, Business POS, sistem kasir restoran, POS retail, cloud POS Indonesia, inventory retail, POS F&B"
        />
      </Head>

      {/* Loading screen with animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-sky-700"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 text-center px-4"
            >
              <span className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
                BEDAGANG
              </span>
              <span className="text-xs sm:text-sm font-medium text-sky-200/80 max-w-sm">
                {COMPANY_LEGAL_NAME}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="min-h-screen w-full flex flex-col overflow-x-hidden font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] antialiased text-slate-900">
        <LandingHeader />
        <BurgerMenu />
        <Hero />
        <SegmentsShowcase />
        <Services />
        <Pricing />
        <Testimonials />
        <LandingFooter />
      </div>
    </>
  );
};

export default Home;