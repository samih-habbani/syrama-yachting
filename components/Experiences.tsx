'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const experiences = [
  {
    title: 'Aquatic Adventures',
    description: 'Thrilling water sports and marine exploration with state-of-the-art equipment',
    highlights: ['Jet ski expeditions', 'Underwater drones', 'Speedboat excursions', 'Tenderboat tours'],
  },
  {
    title: 'Curated Voyages',
    description: 'Bespoke itineraries through pristine waters and exclusive destinations',
    highlights: ['Mediterranean routes', 'Caribbean treasures', 'Private anchorages', 'Hidden islands'],
  },
  {
    title: 'Grand Celebrations',
    description: 'Unforgettable events and entertainment aboard your private superyacht',
    highlights: ['Live orchestras', 'Gala dinners', 'Themed parties', 'Celebrity entertainment'],
  },
  {
    title: 'Marine Discovery',
    description: 'Guided diving expeditions and intimate encounters with ocean life',
    highlights: ['Certified diving', 'Snorkeling tours', 'Wildlife observation', 'Coral expeditions'],
  },
  {
    title: 'Gastronomic Excellence',
    description: 'Sunset dining and culinary masterpieces prepared aboard your vessel',
    highlights: ['Michelin chefs', 'Wine selections', 'Seaside service', 'Fresh seafood'],
  },
  {
    title: 'Serenity Retreats',
    description: 'Wellness programs and rejuvenation amidst the tranquility of the open sea',
    highlights: ['Sunrise yoga', 'Spa therapies', 'Meditation sessions', 'Fitness training'],
  },
];

export default function Experiences() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7 },
    },
  };

  return (
    <section
      id="experiences"
      className="relative py-32 bg-gradient-to-b from-[#0a0d15] via-[#06090f] to-[#06090f] overflow-hidden"
      ref={ref}
    >
      {/* Premium background animation */}
      <motion.div
        className="absolute -bottom-1/4 right-1/4 w-96 h-96 bg-[#b8974a]/8 rounded-full blur-3xl"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Section header */}
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
            MARITIME EXPERIENCES
          </motion.span>
          <h2 className="font-[var(--font-heading)] text-7xl md:text-8xl font-black text-[#f5eedd] mb-6 leading-tight">
            At Sea Moments
          </h2>
          <p className="font-[var(--font-lora)] text-xl text-[#f5eedd]/70 max-w-2xl mx-auto tracking-wide">
            Unforgettable experiences crafted for moments that define a lifetime
          </p>
        </motion.div>

        {/* Experiences Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className="group cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div className="relative bg-gradient-to-br from-[#0a0d15]/70 to-[#06090f]/50 border border-[#b8974a]/25 rounded-lg overflow-hidden hover:border-[#b8974a]/55 transition-all duration-500 h-full shadow-xl shadow-[#000000]/40 hover:shadow-2xl hover:shadow-[#b8974a]/30">
                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#b8974a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#b8974a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image/icon area */}
                <div className="relative h-40 bg-gradient-to-b from-[#1a1a1a] to-[#0a0d15] flex items-center justify-center overflow-hidden group-hover:from-[#252525] transition-all duration-500">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#b8974a]/15 via-transparent to-[#d4b472]/10"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <motion.div
                    className="relative z-10 text-6xl opacity-40 group-hover:opacity-60 transition-opacity"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: idx * 0.1 }}
                  >
                    ▤
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-8 relative z-20">
                  <h3 className="font-[var(--font-heading)] text-2xl font-bold text-[#f5eedd] mb-3 tracking-wider">
                    {exp.title}
                  </h3>

                  <p className="font-[var(--font-lora)] text-[#f5eedd]/70 text-sm mb-6 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {exp.highlights.map((highlight, hidx) => (
                      <motion.div
                        key={hidx}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ delay: idx * 0.08 + hidx * 0.05, duration: 0.4 }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b8974a]" />
                        <span className="font-[var(--font-lora)] text-[#f5eedd]/60 text-xs tracking-wide">
                          {highlight}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-24 p-14 rounded-lg border border-[#b8974a]/30 bg-gradient-to-r from-[#b8974a]/10 to-[#d4b472]/5 relative overflow-hidden shadow-2xl shadow-[#b8974a]/25"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#b8974a]/8 via-transparent to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="font-[var(--font-heading)] text-4xl font-bold text-[#f5eedd] mb-4 text-center tracking-wider">
              Design Your Voyage
            </h3>
            <p className="font-[var(--font-lora)] text-center text-[#f5eedd]/70 text-lg mb-10 leading-relaxed tracking-wide">
              Our concierge specialists work with you to create bespoke maritime experiences tailored to your desires and preferences.
            </p>
            <div className="flex justify-center">
              <motion.button
                className="bg-gradient-to-r from-[#b8974a] to-[#d4b472] hover:from-[#d4b472] hover:to-[#b8974a] text-[#06090f] px-14 py-4 rounded-sm font-[var(--font-heading)] font-bold text-sm tracking-widest transition-all duration-500 shadow-xl shadow-[#b8974a]/40 hover:shadow-2xl hover:shadow-[#b8974a]/60"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                PLAN YOUR EXPERIENCE
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
