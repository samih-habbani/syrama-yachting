'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { getYachtImage } from '@/lib/imageGenerator';

const yachts = [
  {
    name: 'Solaris',
    length: '140m',
    guests: 20,
    price: '$850K/week',
    description: 'Ultimate luxury with world-class amenities and cutting-edge technology',
    category: 'FLAGSHIP',
    gradient: 'from-[#b8974a]/20 to-[#d4b472]/5',
  },
  {
    name: 'Luna',
    length: '115m',
    guests: 14,
    price: '$550K/week',
    description: 'Elegant sophistication with Mediterranean charm and bespoke design',
    category: 'PREMIER',
    gradient: 'from-[#d4b472]/20 to-[#b8974a]/5',
  },
  {
    name: 'Eclipse',
    length: '165m',
    guests: 24,
    price: '$1.2M/week',
    description: 'The pinnacle of superyacht opulence with museum-quality interiors',
    category: 'ICONIC',
    gradient: 'from-[#b8974a]/25 to-[#f5eedd]/5',
  },
  {
    name: 'Serenity',
    length: '95m',
    guests: 12,
    price: '$420K/week',
    description: 'Intimate luxury retreat for the most discerning travelers',
    category: 'EXCLUSIVE',
    gradient: 'from-[#d4b472]/15 to-[#b8974a]/10',
  },
];

export default function Fleet() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7 },
    },
  };

  return (
    <section
      id="fleet"
      className="relative py-32 bg-gradient-to-b from-[#0a0d15] via-[#06090f] to-[#06090f] overflow-hidden"
      ref={ref}
    >
      {/* Premium background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-[#b8974a]/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/4 left-1/4 w-72 h-72 bg-[#d4b472]/5 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Premium section header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9 }}
        >
          <motion.span
            className="inline-block text-[#b8974a] font-[var(--font-lora)] text-xs tracking-[0.3em] uppercase mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          >
            OUR COLLECTION
          </motion.span>
          <h2 className="font-[var(--font-heading)] text-7xl md:text-8xl font-black text-[#f5eedd] mb-6 leading-tight">
            Curated Fleet
          </h2>
          <p className="font-[var(--font-lora)] text-xl text-[#f5eedd]/70 max-w-2xl mx-auto tracking-wide">
            Handpicked superyachts offering uncompromising luxury and bespoke experiences
          </p>
        </motion.div>

        {/* Yachts Grid - Bespoke Style */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {yachts.map((yacht, idx) => (
            <motion.div
              key={idx}
              className="group cursor-pointer relative overflow-hidden rounded-lg h-[600px]"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              {/* Background image with luxury filter */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${getYachtImage(yacht.name)}')`,
                  filter: 'brightness(0.5) contrast(1.15)',
                }}
              />

              {/* Gradient overlay - dark at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/50 to-transparent" />

              {/* Top-right icon indicator */}
              <div className="absolute top-6 right-6 w-8 h-8 border border-[#b8974a]/40 rounded-sm flex items-center justify-center z-30 group-hover:border-[#b8974a]/70 transition-colors">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="0.8" className="text-[#b8974a]" />
                  <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="0.8" className="text-[#b8974a]" />
                </svg>
              </div>

              {/* Content at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                {/* Category label */}
                <div className="mb-3">
                  <span className="font-[var(--font-lora)] text-[#b8974a] text-xs tracking-[0.3em] uppercase font-semibold">
                    {yacht.category}
                  </span>
                </div>

                {/* Yacht name */}
                <h3 className="font-[var(--font-heading)] text-4xl font-bold text-[#f5eedd] mb-2 tracking-wide leading-tight">
                  {yacht.name}
                </h3>

                {/* Description */}
                <p className="font-[var(--font-lora)] text-[#f5eedd]/70 text-sm leading-relaxed mb-4">
                  {yacht.description}
                </p>

                {/* Quick specs row */}
                <div className="flex gap-6 text-xs">
                  <div>
                    <p className="font-[var(--font-lora)] text-[#b8974a] tracking-widest uppercase mb-1">Length</p>
                    <p className="font-[var(--font-heading)] text-[#f5eedd] font-semibold">{yacht.length}</p>
                  </div>
                  <div>
                    <p className="font-[var(--font-lora)] text-[#b8974a] tracking-widest uppercase mb-1">Guests</p>
                    <p className="font-[var(--font-heading)] text-[#f5eedd] font-semibold">{yacht.guests}</p>
                  </div>
                  <div>
                    <p className="font-[var(--font-lora)] text-[#b8974a] tracking-widest uppercase mb-1">From</p>
                    <p className="font-[var(--font-heading)] text-[#d4b472] font-semibold">{yacht.price}</p>
                  </div>
                </div>
              </div>

              {/* Hover overlay with button */}
              <motion.div
                className="absolute inset-0 bg-[#000000]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.button
                  className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-8 py-3 rounded-sm font-[var(--font-heading)] font-bold text-sm tracking-widest transition-all duration-300 shadow-2xl shadow-[#b8974a]/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  VIEW DETAILS
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA section */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="font-[var(--font-lora)] text-[#f5eedd]/70 text-lg mb-8 tracking-wide">
            Seeking a vessel beyond our collection? Our concierge sources bespoke options.
          </p>
          <motion.button
            className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-14 py-4 rounded-sm font-[var(--font-heading)] font-bold text-sm tracking-widest transition-all duration-500 shadow-xl shadow-[#b8974a]/50 hover:shadow-2xl hover:shadow-[#b8974a]/70"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            EXPLORE ALL VESSELS
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
