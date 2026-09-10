'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// pathname seul ne suffit pas : /yachting/fleet sert à la fois le parcours
// charter et vente (distingués par ?tab=sale), donc le param est nécessaire aussi.
// /yacht-charter/* et /yacht-sale/* (destination picker + landing pages SEO
// par destination) sont toujours d'un seul type fixe, donc elles comptent
// comme CHARTERS ou SALES quel que soit tabParam.
function isNavItemActive(href: string, pathname: string, tabParam: string | null) {
  const isFleetPage = pathname === '/yachting/fleet';
  const isCharterPage = pathname === '/yacht-charter' || pathname.startsWith('/yacht-charter/');
  const isSalePage = pathname === '/yacht-sale' || pathname.startsWith('/yacht-sale/');
  if (href === '/yacht-charter') return isCharterPage || (isFleetPage && tabParam !== 'sale');
  if (href === '/yacht-sale') return isSalePage || (isFleetPage && tabParam === 'sale');
  if (href === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
  return pathname === href;
}

// Composant invisible dont le seul rôle est de lire ?tab= et de le faire
// remonter au parent. Isolé ici pour que le seul appel à useSearchParams
// de tout le Navbar reste sous une Suspense minimale (exigence Next.js).
function TabParamReader({ onChange }: { onChange: (tab: string | null) => void }) {
  const tabParam = useSearchParams().get('tab');
  useEffect(() => { onChange(tabParam); }, [tabParam, onChange]);
  return null;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tabParam, setTabParam] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher le back button sur les pages principales
  const mainPages = ['/', '/yacht-charter', '/yacht-sale', '/experiences', '/blog'];
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
    { label: 'CHARTERS', href: '/yacht-charter' },
    { label: 'SALES', href: '/yacht-sale' },
    { label: 'BESPOKE EXPERIENCES', href: '/experiences' },
    { label: 'BLOG', href: '/blog' },
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
      <Suspense fallback={null}>
        <TabParamReader onChange={setTabParam} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Back button (if not on main pages) + Logo */}
          <div className="flex items-center gap-6">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                aria-label="Go back"
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
                <span className="text-[#8f8f7f] font-[var(--font-tenor)] text-xs tracking-widest mt-1">
                  YACHTING
                </span>
              </motion.div>
            </Link>
          </div>

          {/* Center Nav Items */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-12">
            {navItems.map((item, idx) => {
              const isActive = isNavItemActive(item.href, pathname, tabParam);
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
          <div className="flex items-center gap-3 lg:gap-4">
            {isAuthenticated && (
              <Link
                href="/admin/dashboard/yachts"
                className="hidden lg:block text-[#b8974a] hover:text-[#d4b472] font-[var(--font-lora)] text-xs tracking-widest transition-colors duration-300"
              >
                ADMIN
              </Link>
            )}

            {/* Instagram — replaces the former "Find a Yacht" CTA. Styled
                in the site's gold rather than Instagram's own colours. */}
            <motion.a
              href="https://www.instagram.com/syrama_services/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Syrama Yachting on Instagram"
              className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full border border-[#b8974a]/40 text-[#b8974a] hover:text-[#06090f] hover:bg-[#b8974a] transition-colors duration-300 shrink-0"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
              </svg>
            </motion.a>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="lg:hidden relative z-[70] w-6 h-5 flex flex-col justify-between shrink-0"
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
            className="lg:hidden fixed inset-0 z-[60] h-[100dvh] w-screen bg-[#06090f] flex flex-col overflow-hidden"
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
                <span className="text-[#8f8f7f] font-[var(--font-tenor)] text-xs tracking-widest mt-1">
                  YACHTING
                </span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="relative z-10 flex-1 flex flex-col justify-center px-8 gap-1 min-h-0 overflow-y-auto">
              {navItems.map((item, idx) => {
                const isActive = isNavItemActive(item.href, pathname, tabParam);
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
                  href="https://www.youtube.com/@SyramaYachting"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
                >
                  YouTube
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
                  href="mailto:contact@syrama-services.com"
                  onClick={closeMenu}
                  className="flex flex-col gap-1.5 group"
                >
                  <span className="font-[var(--font-lora)] text-[10px] tracking-[0.25em] uppercase text-[#f5eedd]/50">
                    Email
                  </span>
                  <span className="font-[var(--font-cormorant)] text-2xl font-light text-[#d4b472] group-hover:text-[#e8c98a] transition-colors">
                    contact@syrama-services.com
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
