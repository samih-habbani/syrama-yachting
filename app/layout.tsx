import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";
import WhatsappButton from "@/components/WhatsappButton";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} scroll-smooth`}
    >
      <body className="bg-[#06090f] text-[#f5eedd] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <WhatsappButton />
      </body>
    </html>
  );
}
