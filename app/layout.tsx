import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import WhatsappButton from "@/components/WhatsappButton";
import MotionProvider from "@/components/MotionProvider";
import { WhatsappProvider } from "@/components/WhatsappContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://www.syrama-yachting.com";
const SITE_NAME = "Syrama Yachting";
const TITLE = "Luxury Yacht Charter & Sales | Syrama Yachting";
const DESCRIPTION = "Discover luxury yachts for charter across the French Riviera, Mediterranean, Dubai and worldwide. Personal yacht brokerage and bespoke charter experiences by Syrama Yachting.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: ["yacht charter", "luxury yacht", "yacht sales", "yacht brokerage", "French Riviera yacht", "Dubai yacht charter", "Mediterranean yacht charter", "superyacht charter"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  image: `${SITE_URL}/opengraph-image`,
  description: DESCRIPTION,
  areaServed: ["French Riviera", "Mediterranean", "Dubai"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // No global `scroll-smooth` here — it's what was making the browser's
      // (and Next.js's own) navigation-triggered scroll-to-top run as a CSS
      // smooth animation instead of jumping instantly. On a destination
      // page whose images cause layout shift while that animation is still
      // running, the shift throws the animation off and it can land
      // mid-page instead of at the top — exactly the "Other Destinations"
      // link bug. lib/scroll.ts's own smoothScrollToId already implements
      // its own manual, layout-shift-safe easing (via `behavior: 'instant'`
      // per animation frame) for the few places on the site that do want a
      // smooth same-page scroll, so nothing here relied on this class.
      className={`${cormorant.variable} ${lora.variable}`}
    >
      <body className="bg-[#06090f] text-[#f5eedd] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <MotionProvider>
          <WhatsappProvider>
            {children}
            <WhatsappButton />
          </WhatsappProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
