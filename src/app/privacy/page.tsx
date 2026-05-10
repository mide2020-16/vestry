"use client";

import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFooter } from "@/components/LandingFooter";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="pt-32 pb-20 px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-invert prose-amber max-w-none"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-12">Privacy Policy</h1>
          
          <div className="space-y-12 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Data Collection</h2>
              <p>
                We collect information you provide directly to us when you register for an event, create an account, or contact us for support. This may include your name, email address, payment information, and any other details required for event registration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use of Information</h2>
              <p>
                The data we collect is primarily used to process your registrations, manage your event access, and provide you with relevant updates. We also use aggregated, non-identifiable data to improve our platform performance and user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
              <p>
                Security is our top priority. We implement a variety of security measures, including end-to-end encryption and secure socket layer (SSL) technology, to maintain the safety of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Third-Party Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide the services requested (e.g., sharing registration details with the event organizer).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data at any time through your dashboard or by contacting our support team.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
}
