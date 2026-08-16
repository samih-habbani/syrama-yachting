import PageNavbar from '@/components/PageNavbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | Syrama Yachting',
  description: 'Privacy policy for Syrama Yachting.',
};

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen bg-[#06090f]">
      <PageNavbar />
      <main className="flex-1 pt-24">
        <section className="max-w-4xl mx-auto px-8 py-20">
          <h1 className="font-[var(--font-cormorant)] text-5xl font-light text-[#f5eedd] mb-12">
            Privacy Policy
          </h1>

          <div className="space-y-8 font-[var(--font-lora)] text-[#f5eedd]/80 leading-relaxed">
            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                1. Introduction
              </h2>
              <p>
                Syrama Yachting ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information in connection with our websites, mobile applications, and other online services that link to this policy.
              </p>
            </div>

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                2. Information We Collect
              </h2>
              <p>
                We may collect personal information you voluntarily provide, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#f5eedd]/70">
                <li>Name and contact information</li>
                <li>Email address and phone number</li>
                <li>Preferences and interests related to yacht services</li>
                <li>Payment and billing information</li>
                <li>Information provided through inquiry forms</li>
              </ul>
            </div>

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                3. How We Use Your Information
              </h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 text-[#f5eedd]/70">
                <li>Provide yacht charter and sales services</li>
                <li>Respond to inquiries and requests</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                4. Data Protection
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                5. Your Rights
              </h2>
              <p>
                Depending on your location, you may have rights including the right to access, correct, or delete your personal information. To exercise these rights, please contact us using the information provided below.
              </p>
            </div>

            <div>
              <h2 className="font-[var(--font-heading)] text-2xl text-[#f5eedd] mb-4">
                6. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 text-[#f5eedd]/70">
                <p>Syrama Yachting</p>
                <p>Email: <a href="mailto:contact@syrama-yachting.com" className="text-[#b8974a] hover:text-[#d4b472]">contact@syrama-yachting.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/971505548034" className="text-[#b8974a] hover:text-[#d4b472]">+971 50 554 8034</a></p>
              </div>
            </div>

            <div className="pt-8 border-t border-[#b8974a]/20 text-sm text-[#f5eedd]/60">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
