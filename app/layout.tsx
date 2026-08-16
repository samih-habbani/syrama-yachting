import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Luxury Yacht Charter & Sales | Syrama Yachting",
  description: "Discover luxury yachts for charter across the French Riviera, Mediterranean, Dubai and worldwide. Personal yacht brokerage and bespoke charter experiences by Syrama Yachting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} scroll-smooth`}
    >
      <body className="bg-[#06090f] text-[#f5eedd] antialiased">
        {children}
      </body>
    </html>
  );
}
