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
  title: "Syrama Yachting | Luxury Yacht Charter & Sales",
  description: "Experience extraordinary yacht charters and luxury yacht sales with Syrama Yachting",
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
