import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import FleetClient from '@/components/FleetClient';
import Destinations from '@/components/sections/Destinations';
import WhySyrama from '@/components/WhySyrama';
import HowItWorks from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { getYachts } from '@/lib/yacht-service';

export const revalidate = 3600

export default async function Home() {
  const yachts = await getYachts({ type: 'charter', limit: 6 })

  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Intro />
        <FleetClient yachts={yachts} showFilters={false} />
        <Destinations />
        <WhySyrama />
        <HowItWorks />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
