'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { smoothScrollToId } from '@/lib/scroll';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher le back button sur les pages principales
  const mainPages = ['/', '/charters', '/sales', '/experiences'];
  const showBackButton = !mainPages.includes(pathname);

  // Check authentication status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'CHARTERS', href: '/charters' },
    { label: 'SALES', href: '/sales' },
    { label: 'BESPOKE EXPERIENCES', href: '/experiences' },
  ];

  return (
    <motion.nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#06090f]/98 backdrop-blur-xl border-b border-[#b8974a]/30 shadow-2xl shadow-[#000000]/50'
          : 'bg-[#06090f]/80 backdrop-blur-md'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Back button (if not on main pages) + Logo */}
          <div className="flex items-center gap-6">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors duration-300 flex items-center gap-2"
              >
                <svg width="20" height="1" viewBox="0 0 20 1" fill="none">
                  <line x1="20" y1="0.5" x2="0" y2="0.5" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </button>
            )}

            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex flex-col cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[#f5eedd] font-[var(--font-cormorant)] text-xl font-light tracking-widest">
                  SYRAMA
                </span>
                <span className="text-[#6a6a5e] font-[var(--font-tenor)] text-xs tracking-widest mt-1">
                  YACHTING
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Center Nav Items */}
          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    href={item.href}
                    className={`font-[var(--font-lora)] text-sm tracking-wider transition-colors duration-300 relative group inline-block ${
                      isActive
                        ? 'text-[#b8974a]'
                        : 'text-[#f5eedd]/80 hover:text-[#b8974a]'
                    }`}
                  >
                    {item.label}
                    <motion.span
                      className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#b8974a] to-transparent transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Section - Admin Link + CTA Button */}
          <div className="flex items-center gap-3 md:gap-4">
            {isAuthenticated && (
              <Link
                href="/admin/dashboard/yachts"
                className="hidden md:block text-[#b8974a] hover:text-[#d4b472] font-[var(--font-lora)] text-xs tracking-widest transition-colors duration-300"
              >
                ADMIN
              </Link>
            )}

            <Link
              href="/#intro"
              onClick={e => {
                if (pathname === '/') {
                  e.preventDefault()
                  smoothScrollToId('intro')
                }
              }}
            >
              <motion.div
                className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-4 md:px-8 py-2 rounded-sm font-[var(--font-heading)] font-bold text-[10px] md:text-xs tracking-widest transition-all duration-500 shadow-lg shadow-[#b8974a]/40 hover:shadow-xl hover:shadow-[#b8974a]/60 cursor-pointer whitespace-nowrap"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                FIND A YACHT
              </motion.div>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="md:hidden relative z-[70] w-6 h-5 flex flex-col justify-between shrink-0"
            >
              <motion.span
                className="block h-px w-full bg-[#f5eedd] origin-center"
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 9 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <motion.span
                className="block h-px w-full bg-[#f5eedd]"
                animate={{ opacity: isMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-px w-full bg-[#f5eedd] origin-center"
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -9 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="md:hidden fixed inset-0 z-[60] h-[100dvh] w-screen bg-[#06090f] flex flex-col overflow-hidden"
          >
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(184,151,74,0.12), transparent 55%)' }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, #b8974a 30%, #d4b472 50%, #b8974a 70%, transparent)' }}
            />

            {/* Top bar (logo only — hamburger button above already toggles/closes) */}
            <div className="relative z-10 flex items-center px-8 py-5 shrink-0">
              <Link href="/" onClick={closeMenu} className="flex flex-col">
                <span className="text-[#f5eedd] font-[var(--font-cormorant)] text-xl font-light tracking-widest">
                  SYRAMA
                </span>
                <span className="text-[#6a6a5e] font-[var(--font-tenor)] text-xs tracking-widest mt-1">
                  YACHTING
                </span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="relative z-10 flex-1 flex flex-col justify-center px-8 gap-1 min-h-0 overflow-y-auto">
              {navItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + idx * 0.07, ease: [0.25, 0.1, 0, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`font-[var(--font-cormorant)] font-light tracking-wide leading-tight py-3 inline-flex items-baseline gap-4 transition-colors duration-300 ${
                        isActive ? 'text-[#b8974a]' : 'text-[#f5eedd] hover:text-[#b8974a]'
                      }`}
                      style={{ fontSize: 'clamp(34px, 10vw, 52px)' }}
                    >
                      {item.label}
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#b8974a] mb-2" />}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Divider */}
            <div
              className="relative z-10 mx-8 h-px shrink-0"
              style={{ background: 'linear-gradient(to right, transparent, rgba(184,151,74,0.3) 30%, rgba(184,151,74,0.3) 70%, transparent)' }}
            />

            {/* Contact & socials */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 0.1, 0, 1] }}
              className="relative z-10 px-8 py-8 shrink-0"
            >
              <div className="flex items-center gap-8 mb-7">
                <a
                  href="https://www.instagram.com/syrama_services/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.linkedin.com/in/samih-habbani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
                >
                  LinkedIn
                </a>
              </div>

              <div className="flex flex-col gap-5">
                <a
                  href="tel:+971505548034"
                  onClick={closeMenu}
                  className="flex flex-col gap-1.5 group"
                >
                  <span className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/50">
                    WhatsApp / Phone
                  </span>
                  <span className="font-[var(--font-cormorant)] text-2xl font-light text-[#d4b472] group-hover:text-[#e8c98a] transition-colors">
                    +971 50 554 8034
                  </span>
                </a>
                <a
                  href="mailto:contact@syrama.ae"
                  onClick={closeMenu}
                  className="flex flex-col gap-1.5 group"
                >
                  <span className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/50">
                    Email
                  </span>
                  <span className="font-[var(--font-cormorant)] text-2xl font-light text-[#d4b472] group-hover:text-[#e8c98a] transition-colors">
                    contact@syrama.ae
                  </span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
