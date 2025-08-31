import type { GetServerSideProps } from "next";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="container-page py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground mb-4">
              By accessing and using BOKT. ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-foreground mb-4">
              BOKT is a platform that connects brands with professional models for photoshoots and modeling projects. We facilitate booking arrangements, payment processing, and communication between parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-foreground mb-4">
              To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Model Profiles and Bookings</h2>
            <p className="text-foreground mb-4">
                Models must provide accurate information about their experience, measurements, and availability.
                Models have the right to accept, refuse, or counter booking offers. Bookings are considered
                half-day if under 4 hours, and full day if 4 hours or more. The minimum fees are 2,500 EGP for
                half-day and 3,500 EGP for full or multi-day. Transportation outside of the model’s declared
                living city must be covered by the business.
            </p>
            </section>

            <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment and Fees</h2>
            <p className="text-foreground mb-4">
                Businesses are responsible for paying the model’s agreed fee, in addition to a 20% service
                commission charged by BOKT. All payments are processed through secure channels. Models receive
                their fee minus commission, with payouts made within 2 business days after the shoot is
                completed. No subscription or upfront fees are required to use the platform.
            </p>
            </section>

            <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cancellation and Refunds</h2>
            <p className="text-foreground mb-4">
                Cancellation policies depend on the timing of the cancellation. If a model cancels, BOKT will
                assist the business in finding alternatives. If a model fails to show up without notice, the
                business will receive a full refund and assistance in securing replacements. Businesses may
                incur fees for late cancellations. All parties are expected to adhere to agreed-upon booking
                terms.
            </p>
            </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-foreground mb-4">
              All content on the Platform, including text, graphics, logos, and software, is the property of BOKT or its content suppliers and is protected by copyright laws. Users retain rights to their own content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data Protection</h2>
            <p className="text-foreground mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Prohibited Uses</h2>
            <p className="text-foreground mb-4">
              You may not use the Platform for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
            <p className="text-foreground mb-4">
              BOKT shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform or any services provided through it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
            <p className="text-foreground mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Information</h2>
            <p className="text-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-foreground mb-2">Email: legal@bokt.dev</p>
              <p className="text-foreground mb-2">Phone: +20 115 888 9002</p>
              <p className="text-foreground">Address: Cairo, Egypt</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link 
            href="/" 
            className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};
