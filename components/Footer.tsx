'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkMap: Record<string, string> = {
    // YACHT CHARTER section
    'French Riviera': '/charters?region=french-riviera',
    'Cannes': '/charters?region=cannes',
    'Saint-Tropez': '/charters?region=saint-tropez',
    'Monaco': '/charters?region=monaco',
    'Dubai': '/charters?region=dubai',
    'All Yachts': '/charters',
    // SERVICES section
    'Yacht Charter': '/charters',
    'Yacht Sales': '/sales',
    'Bespoke Experiences': '/experiences',
    // SYRAMA section
    'About': '/about',
    'Contact': '/#contact',
    'Instagram': 'https://www.instagram.com/syrama_services/',
    'LinkedIn': 'https://www.linkedin.com/in/samih-habbani/',
  };

  const footerLinks = [
    {
      category: 'YACHT CHARTER',
      links: ['French Riviera', 'Cannes', 'Saint-Tropez', 'Monaco', 'Dubai', 'All Yachts'],
    },
    {
      category: 'SERVICES',
      links: ['Yacht Charter', 'Yacht Sales', 'Bespoke Experiences'],
    },
    {
      category: 'SYRAMA',
      links: ['About', 'Contact', 'Instagram', 'LinkedIn'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="relative bg-[#06090f] border-t border-[#b8974a]/30 py-20">
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#b8974a]/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Top section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b8974a] to-[#d4b472] rounded-sm flex items-center justify-center shadow-lg shadow-[#b8974a]/30">
                <span className="text-[#06090f] font-[var(--font-heading)] font-bold">𝙎</span>
              </div>
              <span className="text-[#f5eedd] font-[var(--font-heading)] text-lg font-bold tracking-widest">
                SYRAMA
              </span>
            </div>
            <p className="font-[var(--font-lora)] text-[#f5eedd]/60 text-sm leading-relaxed tracking-wide">
              Luxury yacht charter and sales across the Mediterranean and worldwide.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href="tel:+971505548034"
                className="flex items-center gap-2.5 font-[var(--font-lora)] text-[#f5eedd]/60 text-sm tracking-wide hover:text-[#b8974a] transition-colors"
              >
                <Phone size={14} strokeWidth={1.75} className="text-[#b8974a] shrink-0" />
                +971 50 554 8034
              </a>
              <a
                href="mailto:contact@syrama-services.com"
                className="flex items-center gap-2.5 font-[var(--font-lora)] text-[#f5eedd]/60 text-sm tracking-wide hover:text-[#b8974a] transition-colors"
              >
                <Mail size={14} strokeWidth={1.75} className="text-[#b8974a] shrink-0" />
                contact@syrama-services.com
              </a>
            </div>
          </motion.div>

          {/* Links sections */}
          {footerLinks.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="font-[var(--font-heading)] text-[#b8974a] font-bold mb-6 text-xs tracking-widest uppercase">
                {section.category}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => {
                  const href = linkMap[link] || '#';
                  const isExternal = href.startsWith('http');

                  return (
                    <li key={linkIdx}>
                      {isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-[var(--font-lora)] text-[#f5eedd]/70 hover:text-[#b8974a] transition-colors duration-300 text-sm tracking-wide"
                        >
                          {link}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="font-[var(--font-lora)] text-[#f5eedd]/70 hover:text-[#b8974a] transition-colors duration-300 text-sm tracking-wide"
                        >
                          {link}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="border-t border-[#b8974a]/20 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Bottom section */}
          <motion.div
            className="flex justify-between items-center flex-col md:flex-row gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Copyright */}
            <motion.div
              className="font-[var(--font-lora)] text-[#f5eedd]/60 text-sm tracking-wide text-center md:text-left"
              variants={itemVariants}
            >
              <p>© {currentYear} Syrama Yachting. All rights reserved.</p>
            </motion.div>

            {/* Contact & Links */}
            <motion.div
              className="flex items-center gap-6 text-sm tracking-wide flex-wrap justify-center md:justify-end"
              variants={itemVariants}
            >
              <a
                href="https://www.instagram.com/syrama_services/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
              >
                Instagram
              </a>
              <span className="text-[#b8974a]/30">•</span>
              <a
                href="https://wa.me/971505548034"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
              >
                WhatsApp +971 50 554 8034
              </a>
              <span className="text-[#b8974a]/30">•</span>
              <Link
                href="/privacy"
                className="text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors"
              >
                Privacy
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Legal/Compliance footer */}
        <motion.div
          className="mt-8 pt-8 border-t border-[#b8974a]/20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-[var(--font-lora)] text-[#f5eedd]/40 text-xs tracking-widest">
            LUXURY YACHT CHARTER & SALES | WORLDWIDE SERVICE
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
