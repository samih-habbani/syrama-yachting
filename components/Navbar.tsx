'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'YACHTS', href: '#fleet' },
    { label: 'SERVICES', href: '#services' },
    { label: 'EXPERIENCES', href: '#experiences' },
    { label: 'CONTACT', href: '#contact' },
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
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#b8974a] to-[#d4b472] rounded-sm flex items-center justify-center shadow-lg shadow-[#b8974a]/30">
              <span className="text-[#06090f] font-[var(--font-heading)] font-bold text-sm">𝙎</span>
            </div>
            <span className="text-[#f5eedd] font-[var(--font-heading)] text-lg font-bold tracking-widest">
              SYRAMA
            </span>
          </motion.div>

          {/* Center Nav Items */}
          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                className="text-[#f5eedd]/80 hover:text-[#b8974a] font-[var(--font-lora)] text-sm tracking-wider transition-colors duration-300 relative group"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-[#b8974a] to-transparent group-hover:w-full transition-all duration-300"
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-8 py-2 rounded-sm font-[var(--font-heading)] font-bold text-xs tracking-widest transition-all duration-500 shadow-lg shadow-[#b8974a]/40 hover:shadow-xl hover:shadow-[#b8974a]/60"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            INQUIRE
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className="md:hidden flex flex-col gap-4 mt-6 pb-4 border-t border-[#b8974a]/20 pt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isScrolled ? 1 : 0, height: isScrolled ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="text-[#f5eedd]/80 font-[var(--font-lora)] text-sm tracking-wide hover:text-[#b8974a] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      </div>
    </motion.nav>
  );
}
