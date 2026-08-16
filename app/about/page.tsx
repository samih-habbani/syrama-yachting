import Navbar from '@/components/Navbar';
import PageNavbar from '@/components/PageNavbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About | Syrama Yachting',
  description: 'Learn about Syrama Yachting, the luxury yacht charter and sales division of Syrama Services.',
};

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <PageNavbar />
      <main className="flex-1 pt-24">
        {/* Hero section */}
        <section className="max-w-4xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="font-[var(--font-cormorant)] text-5xl md:text-6xl font-light text-[#f5eedd] mb-6">
              About Syrama Yachting
            </h1>
            <p className="font-[var(--font-lora)] text-lg text-[#f5eedd]/70">
              Part of the Syrama Services ecosystem
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 font-[var(--font-lora)] text-[#f5eedd]/80 leading-relaxed">
            <p className="text-base">
              Syrama Yachting is the luxury yacht charter and sales division of{' '}
              <a
                href="https://syrama-services.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b8974a] hover:text-[#d4b472] transition-colors"
              >
                Syrama Services
              </a>
              . We specialize in providing exceptional yacht experiences and brokerage services to discerning clients worldwide.
            </p>

            <p>
              Our team combines decades of maritime expertise with a deep understanding of luxury travel and yacht acquisition. Whether you're seeking the perfect yacht for charter across the French Riviera, Mediterranean, Dubai, or beyond, or looking to acquire a superyacht, we provide personalized service tailored to your exact needs.
            </p>

            <p>
              Based on years of experience in the yachting industry, we have curated an exclusive fleet of vessels and established relationships with leading yacht builders, charter companies, and maritime specialists worldwide. Every vessel in our fleet is meticulously selected, maintained to the highest standards, and staffed by elite crews.
            </p>

            <div className="pt-8 border-t border-[#b8974a]/20">
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                Our Services
              </h2>
              <ul className="space-y-3 list-disc list-inside text-[#f5eedd]/70">
                <li>Luxury Yacht Charter</li>
                <li>Yacht Sales & Brokerage</li>
                <li>Bespoke Maritime Experiences</li>
                <li>Yacht Management Consultation</li>
                <li>Concierge Services</li>
              </ul>
            </div>

            <div className="pt-8">
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                Get in Touch
              </h2>
              <p className="mb-6">
                Ready to discuss your yacht charter or acquisition needs? Contact our brokers and concierge team.
              </p>
              <a
                href="/#contact"
                className="inline-block bg-[#b8974a] hover:bg-[#d4b472] text-[#06090f] px-8 py-3 font-[var(--font-lora)] text-sm tracking-widest uppercase transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
