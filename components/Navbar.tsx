'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher le back button sur les pages principales
  const mainPages = ['/', '/charters', '/sales', '/experiences'];
  const showBackButton = !mainPages.includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="max-w-7xl mx-auto px-8 py-5">
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard/yachts"
              className="text-[#b8974a] hover:text-[#d4b472] font-[var(--font-lora)] text-xs tracking-widest transition-colors duration-300"
            >
              ADMIN
            </Link>

            <motion.button
              className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-8 py-2 rounded-sm font-[var(--font-heading)] font-bold text-xs tracking-widest transition-all duration-500 shadow-lg shadow-[#b8974a]/40 hover:shadow-xl hover:shadow-[#b8974a]/60"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              INQUIRE
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className="md:hidden flex flex-col gap-4 mt-6 pb-4 border-t border-[#b8974a]/20 pt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isScrolled ? 1 : 0, height: isScrolled ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="text-[#f5eedd]/80 font-[var(--font-lora)] text-sm tracking-wide hover:text-[#b8974a] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.nav>
  );
}
