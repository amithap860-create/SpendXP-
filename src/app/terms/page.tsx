export const metadata = {
  title: 'Terms of Service | SpendXP',
  description: 'SpendXP Terms of Service — rules, subscriptions, virtual currency, and your rights.',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'April 27, 2026';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <a href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
            ← Back to SpendXP
          </a>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 mt-2 font-medium">Last updated: {lastUpdated}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">

          {/* Intro */}
          <section>
            <p className="text-base">
              These Terms of Service (&quot;Terms&quot;) govern your use of SpendXP, a gamified financial literacy platform. By creating an account or using SpendXP, you agree to these Terms. If you are under 18, your parent or guardian must also agree to these Terms on your behalf.
            </p>
            <p className="mt-3 text-base">
              Please read these Terms carefully. The key points are: SpendXP is an educational tool, all currencies and investments within the app are virtual and have no real monetary value, and SpendXP Pro is a paid subscription with specific cancellation and refund rules.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Who Can Use SpendXP</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-bold">Age 8+:</span> SpendXP is designed for users aged 8 and above. Users under 13 require verifiable parental consent before their account is activated.</p>
              <p><span className="font-bold">Parental responsibility:</span> If you allow your child to use SpendXP, you are responsible for supervising their use and ensuring they follow these Terms.</p>
              <p><span className="font-bold">Accurate information:</span> You must provide accurate information when creating your account. Providing false information (including a false age) is a violation of these Terms.</p>
              <p><span className="font-bold">One account per person:</span> You may not create multiple accounts for the same person. Duplicate accounts may be merged or removed.</p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. The SpendXP Service</h2>
            <div className="space-y-3 text-sm">
              <p>SpendXP provides educational content, simulated financial games, quests, a virtual market simulator, and financial literacy tools. All content is for educational and entertainment purposes only.</p>
              <p>SpendXP does not provide financial advice, investment advice, tax advice, or legal advice. Nothing in the app should be construed as a recommendation to make any real-world financial decision.</p>
              <p>We reserve the right to modify, suspend, or discontinue any feature of the service at any time. We will give reasonable notice of significant changes where possible.</p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Virtual Currency &amp; In-App Items</h2>
            <div className="space-y-3 text-sm">
              <p>SpendXP uses virtual currencies including XP (experience points) and a virtual balance displayed in a local currency equivalent. These are purely educational tools:</p>
              <ul className="space-y-1 pl-4">
                <li>• Virtual currencies have <strong>no real monetary value</strong></li>
                <li>• They cannot be exchanged for real money, goods, or services</li>
                <li>• They cannot be transferred between accounts</li>
                <li>• They are not redeemable or refundable under any circumstances</li>
                <li>• Virtual market prices are simulated and do not reflect real stock market data</li>
              </ul>
              <p>Badges, certificates, and achievements are recognition tools within SpendXP and confer no legal rights or real-world financial benefits.</p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. SpendXP Pro — Subscription Terms</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="font-bold text-slate-800 mb-2">Current Plans (India)</p>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>Monthly: ₹99–₹149 / month</p>
                  <p>Annual: ₹799 / year (best value)</p>
                  <p>Family: ₹199 / month (up to 3 child profiles)</p>
                  <p>Pricing for other countries is displayed in the app in your local currency.</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <p><span className="font-bold">Free Trial:</span> New users may be eligible for a 7-day free trial. No payment is required to start a trial. At the end of the trial, your subscription will automatically begin unless you cancel before the trial ends.</p>
                <p><span className="font-bold">Billing:</span> Subscriptions are billed in advance. Payments are processed by Razorpay. By subscribing, you authorise Razorpay to charge your selected payment method on a recurring basis.</p>
                <p><span className="font-bold">Cancellation:</span> You may cancel your subscription at any time from your profile settings. Cancellation takes effect at the end of the current billing period — you retain Pro access until then. There is no penalty for cancellation.</p>
                <p><span className="font-bold">Refunds:</span> We offer a full refund within 7 days of your first paid subscription charge if you are unsatisfied with SpendXP Pro. After 7 days, no refunds are issued for the current billing period. Refund requests must be sent to <a href="mailto:support@spendxp.app" className="text-primary underline">support@spendxp.app</a>.</p>
                <p><span className="font-bold">Price changes:</span> We will give at least 30 days notice before any price increase, allowing you to cancel before the new price takes effect.</p>
                <p><span className="font-bold">Family plan:</span> The account owner is responsible for all charges on a family plan. Child profiles under a family plan are subject to the same Terms and Privacy Policy.</p>
              </div>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Acceptable Use</h2>
            <p className="text-sm mb-3">You agree not to:</p>
            <ul className="space-y-2 text-sm pl-4">
              <li>• Use SpendXP for any unlawful purpose</li>
              <li>• Attempt to hack, reverse-engineer, or tamper with the app or its data</li>
              <li>• Create accounts for the purpose of exploiting free trial offers repeatedly</li>
              <li>• Impersonate another user, parent, or SpendXP staff</li>
              <li>• Submit abusive, offensive, or inappropriate content via any feedback or bug reporting tool</li>
              <li>• Use the app in a way that disrupts other users&apos; experience</li>
            </ul>
            <p className="mt-3 text-sm">Violation of these rules may result in immediate account suspension or termination without refund.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">6. Intellectual Property</h2>
            <p className="text-sm">All content in SpendXP — including lesson content, quest narratives, game mechanics, graphics, icons, and the SpendXP name and logo — is owned by SpendXP and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any SpendXP content without written permission.</p>
            <p className="mt-3 text-sm">Your account data (your progress, XP, choices) remains yours. You grant us a licence to store and process this data to operate the service.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">7. Parent Dashboard &amp; Parental Controls</h2>
            <p className="text-sm">Parents who activate the Parent Dashboard can view their child&apos;s learning progress, XP, and activity. The Parent Dashboard does not allow parents to alter a child&apos;s virtual balance or XP — it is a read-only monitoring tool unless otherwise stated. Parents can request full data deletion of their child&apos;s account at any time by emailing <a href="mailto:privacy@spendxp.app" className="text-primary underline">privacy@spendxp.app</a>.</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-sm">SpendXP is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. Educational content is provided in good faith but may contain inaccuracies — always verify important financial information with a qualified professional.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-sm">To the maximum extent permitted by applicable law, SpendXP shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">10. Termination</h2>
            <p className="text-sm">You may delete your account at any time from the Profile page. We may suspend or terminate your account if you violate these Terms. Upon termination, your access to SpendXP Pro ends immediately. Pro subscribers who are terminated for Terms violations are not entitled to a refund.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">11. Governing Law &amp; Disputes</h2>
            <p className="text-sm">These Terms are governed by the laws of India. Any disputes will be resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be Bengaluru, India. Users outside India may have additional rights under their local consumer protection laws, which are not affected by this clause.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">12. Changes to These Terms</h2>
            <p className="text-sm">We may update these Terms as SpendXP grows. We will notify you by email at least 14 days before material changes take effect. Continued use after that date constitutes acceptance. If you do not agree to the updated Terms, you may cancel your subscription and delete your account before the changes take effect.</p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">13. Contact</h2>
            <div className="text-sm space-y-1">
              <p>Questions about these Terms?</p>
              <p>📧 <a href="mailto:support@spendxp.app" className="text-primary underline font-bold">support@spendxp.app</a></p>
              <p>For privacy or data requests: <a href="mailto:privacy@spendxp.app" className="text-primary underline font-bold">privacy@spendxp.app</a></p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
          <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/dashboard" className="hover:text-primary transition-colors">Back to App</a>
        </div>
      </div>
    </div>
  );
}
