'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      category: 'EXPERIENCES',
      links: ['Yacht Charter', 'Luxury Sales', 'Fleet Management', 'Custom Voyages'],
    },
    {
      category: 'COMPANY',
      links: ['About Syrama', 'Our Story', 'Careers', 'Awards'],
    },
    {
      category: 'RESOURCES',
      links: ['Blog', 'Destinations', 'Press', 'Contact'],
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
              Luxury yacht experiences for the world's most discerning travelers.
            </p>
          </motion.div>

          {/* Links sections */}
          {footerLinks.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="font-[var(--font-heading)] text-[#b8974a] font-bold mb-6 text-xs tracking-widest uppercase">
                {section.category}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href="#"
                      className="font-[var(--font-lora)] text-[#f5eedd]/70 hover:text-[#b8974a] transition-colors duration-300 text-sm tracking-wide"
                    >
                      {link}
                    </a>
                  </li>
                ))}
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
            {/* Social Links */}
            <motion.div
              className="flex gap-8"
              variants={itemVariants}
            >
              {['Instagram', 'Facebook', 'LinkedIn', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="font-[var(--font-lora)] text-[#f5eedd]/60 hover:text-[#b8974a] transition-colors duration-300 text-sm tracking-wide"
                >
                  {social}
                </a>
              ))}
            </motion.div>

            {/* Copyright */}
            <motion.p
              className="font-[var(--font-lora)] text-[#f5eedd]/60 text-sm tracking-wide text-center md:text-right"
              variants={itemVariants}
            >
              © {currentYear} Syrama Yachting. All rights reserved.
            </motion.p>
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
            LUXURY MARITIME EXPERIENCES | WORLDWIDE SERVICE | ESTABLISHED 2024
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
