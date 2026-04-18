import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Home,
  LogIn,
  LogOut,
  LayoutDashboard,
  UserPlus,
  Layers,
  CreditCard,
  MessagesSquare,
  Building2,
} from 'lucide-react';
import { COMPANY_LEGAL_NAME, PRODUCT_LINE } from './brand';

const BurgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/?logout=success' });
    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Button */}
      <motion.button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        className="fixed top-3 right-4 sm:top-4 sm:right-6 z-50 md:hidden rounded-full border border-slate-200/80 bg-white/90 p-3 shadow-md shadow-slate-900/10 backdrop-blur-md hover:bg-white transition-colors"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-800" />
        ) : (
          <Menu className="w-6 h-6 text-slate-800" />
        )}
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[min(100vw-3rem,20rem)] sm:w-80 bg-gradient-to-br from-slate-900 via-blue-900 to-sky-700 z-40 shadow-2xl"
            >
              <div className="flex flex-col h-full p-8 pt-20 sm:pt-24">
                {/* Logo/Brand */}
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-white mb-2">BEDAGANG</h2>
                  <p className="text-sky-100/90 text-xs font-medium uppercase tracking-wide text-sky-200/80">
                    {COMPANY_LEGAL_NAME}
                  </p>
                  <p className="text-sky-100/90 text-sm mt-2 leading-relaxed">{PRODUCT_LINE}</p>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 space-y-4">
                  <motion.button
                    onClick={() => handleNavigation('/')}
                    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Beranda</span>
                  </motion.button>

                  <a
                    href="#perusahaan"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                  >
                    <Building2 className="w-5 h-5" aria-hidden />
                    <span className="font-medium">Perusahaan</span>
                  </a>
                  <a
                    href="#fitur"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                  >
                    <Layers className="w-5 h-5" aria-hidden />
                    <span className="font-medium">Fitur</span>
                  </a>
                  <a
                    href="#harga"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                  >
                    <CreditCard className="w-5 h-5" aria-hidden />
                    <span className="font-medium">Harga</span>
                  </a>
                  <a
                    href="#testimoni"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                  >
                    <MessagesSquare className="w-5 h-5" aria-hidden />
                    <span className="font-medium">Testimoni</span>
                  </a>

                  {session ? (
                    <>
                      <motion.button
                        onClick={() => handleNavigation('/dashboard')}
                        className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </motion.button>

                      {/* Admin Panel Link - Only for ADMIN and SUPER_ADMIN */}
                      {(session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') && (
                        <motion.button
                          onClick={() => handleNavigation('/admin')}
                          className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors border border-white/30"
                          whileHover={{ x: 5 }}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-medium">Admin Panel</span>
                        </motion.button>
                      )}

                      <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => handleNavigation('/auth/login')}
                        className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="font-medium">Login</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleNavigation('/auth/register')}
                        className="w-full flex items-center space-x-3 text-white hover:bg-white/10 rounded-lg p-3 transition-colors border border-white/20"
                        whileHover={{ x: 5 }}
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Daftar gratis</span>
                      </motion.button>
                    </>
                  )}
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-white/20">
                  <p className="text-sky-100 text-xs text-center">
                    © {new Date().getFullYear()} BEDAGANG
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BurgerMenu;
