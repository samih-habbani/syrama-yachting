import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Intro from '@/components/Intro';
import Fleet from '@/components/Fleet';
import Destinations from '@/components/sections/Destinations';
import Services from '@/components/Services';
import Experiences from '@/components/Experiences';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Intro />
        <Fleet />
        <Destinations />
        <Services />
        <Experiences />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
