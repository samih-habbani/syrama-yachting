'use client';

// Trust section for the footer — the business's real Google rating and a
// few of its real reviews (see https://share.google/PeporfU160tFxWfOv),
// not a generic testimonials placeholder. Static rather than pulled live
// via the Google Places API: that needs a billed Google Cloud API key this
// project doesn't have configured. Update the content below by hand when
// new reviews come in, or wire it up to the Places API later if a key
// becomes available.
import { motion } from 'framer-motion';

const RATING = 5.0;
const REVIEW_COUNT = 6;
const REVIEWS_URL = 'https://share.google/PeporfU160tFxWfOv';

const reviews = [
  {
    name: 'Pierre Messina',
    text: 'We trusted the Syrama Services team for the rental of a super yacht in Dubai, and everything was handled flawlessly. The service was fast, discreet, and extremely professional, with great attention to our expectations.',
  },
  {
    name: 'Thomas Munier',
    text: 'Great experience with Syrama Services. Adel and Sam perfectly understood our needs and found us the ideal villa in the Caribbean. Very reactive, discreet, and highly professional throughout.',
  },
  {
    name: 'Florent Duclos',
    text: 'We relied on the Syrama Services team to handle our entire trip, from jet transfers to the chalet, restaurants and daily plans. Everything flowed effortlessly, with great attention to detail throughout the stay.',
  },
];

function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#b8974a">
          <path d="M12 2.5l2.94 6.36 6.98.72-5.2 4.78 1.5 6.9L12 17.9l-6.22 3.36 1.5-6.9-5.2-4.78 6.98-.72L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function GoogleReviews() {
  return (
    <motion.div
      className="border-t border-[#b8974a]/20 py-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Rating header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 mb-4">
          <GoogleLogo />
          <span className="font-[var(--font-lora)] text-[#f5eedd]/70 text-xs tracking-[0.2em] uppercase">
            Google Reviews
          </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="font-[var(--font-cormorant)] text-[#f5eedd] text-6xl font-light leading-none">
            {RATING.toFixed(1)}
          </span>
          <Stars size={26} />
        </div>
        <p className="font-[var(--font-lora)] text-[#f5eedd]/50 text-sm tracking-wide">
          Based on {REVIEW_COUNT} Google reviews
        </p>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="border border-[#b8974a]/15 rounded-sm p-6 bg-[#b8974a]/[0.03]"
          >
            <Stars size={14} />
            <p className="font-[var(--font-lora)] text-[#f5eedd]/70 text-sm leading-relaxed mt-4 mb-4">
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="font-[var(--font-lora)] text-[#b8974a] text-xs tracking-wide font-semibold">
              {review.name}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href={REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[var(--font-lora)] text-[#b8974a] text-xs tracking-[0.15em] uppercase border border-[#b8974a]/30 px-6 py-3 hover:bg-[#b8974a]/10 transition-colors"
        >
          Read All Reviews on Google
        </a>
      </div>
    </motion.div>
  );
}
