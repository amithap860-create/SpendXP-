export const metadata = {
  title: 'Privacy Policy | SpendXP',
  description: 'SpendXP Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 27, 2026';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <a href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-6 hover:underline">
            ← Back to SpendXP
          </a>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 mt-2 font-medium">Last updated: {lastUpdated}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">

          {/* Intro */}
          <section>
            <p className="text-base">
              SpendXP (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy of all users, especially children and teenagers. This Privacy Policy explains what data we collect, why we collect it, how it is used, and your rights regarding that data. By using SpendXP, you agree to this policy.
            </p>
            <p className="mt-4 text-base font-semibold text-slate-800">
              SpendXP is designed for users aged 8–20. If you are under 18, please review this policy with a parent or guardian before using the app.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Who We Are</h2>
            <p>
              SpendXP is a gamified financial literacy platform developed and operated by the SpendXP team. Our registered address and company details are available on request at <a href="mailto:privacy@spendxp.app" className="text-primary underline">privacy@spendxp.app</a>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Information We Collect</h2>
            <p className="mb-4">We collect the minimum information needed to operate the service:</p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 mb-1">Account Information</p>
                <p className="text-sm">Email address, display name (or nickname chosen during onboarding), age group, and country. We do not collect full legal name, home address, phone number, or payment card details directly — payments are handled by Razorpay.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 mb-1">Usage Data</p>
                <p className="text-sm">Lessons completed, quests finished, XP earned, virtual balance, streak count, quiz scores, and in-app activity timestamps. This data is used to personalise your learning path and award badges.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 mb-1">Device &amp; Technical Data</p>
                <p className="text-sm">Browser type, operating system, device type, and IP address (used for fraud prevention and crash reporting only). We do not fingerprint devices or track users across third-party websites.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-900 mb-1">Parental Consent Records</p>
                <p className="text-sm">For users under 13 (or under 18 where required by local law), we store a timestamped record of parental consent, including the parent&apos;s email address used to verify consent. This record is never shared with third parties.</p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To create and manage your account</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To track learning progress, XP, streaks, badges, and virtual portfolio</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To send streak reminders and educational notifications (opt-out available in settings)</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To provide parents with activity summaries (if Parent Dashboard is enabled)</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To process subscription payments via Razorpay</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To improve app features and fix bugs using anonymised analytics</li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> To comply with our legal obligations</li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-[#2E7D5A] bg-[#E8F5EE] p-3 rounded-lg border border-[#A8D5BC]">
              We never sell your personal data to third parties. We never use your data for advertising profiles or share it with data brokers.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Children&apos;s Privacy (COPPA &amp; DPDP Compliance)</h2>
            <p className="mb-3">SpendXP is specifically designed with children&apos;s privacy as a priority. We comply with the US Children&apos;s Online Privacy Protection Act (COPPA), India&apos;s Digital Personal Data Protection Act 2023 (DPDP Act), and equivalent regulations in all countries we serve.</p>
            <div className="space-y-3 text-sm">
              <p><span className="font-bold">Under 13:</span> We require verifiable parental consent before collecting any personal data. The parent&apos;s email is verified via a confirmation link before the child&apos;s account is activated. No data is stored for under-13 users until consent is confirmed.</p>
              <p><span className="font-bold">Ages 13–17:</span> A parental awareness flow is shown during onboarding. Parents can access the Parent Dashboard to review activity, set limits, and request data deletion at any time.</p>
              <p><span className="font-bold">No targeted advertising to minors:</span> SpendXP Pro is ad-free. We do not run behavioural advertising of any kind toward users under 18.</p>
              <p><span className="font-bold">No social profiling:</span> We do not share minor users&apos; data with social networks or advertising platforms.</p>
              <p><span className="font-bold">Data minimisation:</span> We collect only what is necessary for the educational service. We do not collect sensitive personal information (health, financial, location, biometric) from any user.</p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Data Sharing</h2>
            <p className="mb-3">We share data only with the following categories of trusted service providers, under strict data processing agreements:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-3 font-black text-slate-700 border border-slate-200">Provider</th>
                    <th className="text-left p-3 font-black text-slate-700 border border-slate-200">Purpose</th>
                    <th className="text-left p-3 font-black text-slate-700 border border-slate-200">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-slate-200 font-medium">Google Firebase</td>
                    <td className="p-3 border border-slate-200">Authentication, database, hosting</td>
                    <td className="p-3 border border-slate-200">Account data, progress data</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-3 border border-slate-200 font-medium">Razorpay</td>
                    <td className="p-3 border border-slate-200">Payment processing (Pro subscriptions)</td>
                    <td className="p-3 border border-slate-200">Email, subscription plan (no card data stored by us)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-slate-200 font-medium">Vercel</td>
                    <td className="p-3 border border-slate-200">Web hosting and edge delivery</td>
                    <td className="p-3 border border-slate-200">IP address (anonymised after 24 hours)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">We may disclose data if required by law, court order, or to protect the safety of our users. In such cases, we will notify affected users where legally permitted.</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">6. Virtual Currency &amp; Transactions</h2>
            <p className="text-sm">SpendXP uses virtual currencies (XP, virtual balance in local currency equivalent) for educational simulation only. These have <strong>no real monetary value</strong>, cannot be withdrawn, transferred, or exchanged for real money, and do not constitute a financial product. Virtual market simulations use fictional prices for educational purposes only.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">7. Data Retention</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-bold">Active accounts:</span> Data is retained while your account is active.</p>
              <p><span className="font-bold">Inactive accounts:</span> Accounts with no login for 24 months will receive a deletion notice. If no response, account data is deleted within 30 days.</p>
              <p><span className="font-bold">Deleted accounts:</span> All personal data is permanently deleted within 30 days of a deletion request. Anonymised, aggregated analytics data (no personal identifiers) may be retained for product improvement.</p>
              <p><span className="font-bold">Parental consent records:</span> Retained for 5 years for legal compliance, then permanently deleted.</p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">8. Your Rights</h2>
            <p className="mb-3 text-sm">Depending on your country, you (and parents/guardians of minor users) have the following rights:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Access:</strong> Request a copy of your personal data</span></li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Correction:</strong> Correct inaccurate or incomplete data</span></li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Deletion:</strong> Request permanent deletion of your account and all associated data</span></li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Portability:</strong> Receive your data in a machine-readable format (JSON)</span></li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Withdrawal of consent:</strong> Revoke consent at any time; this will deactivate the account</span></li>
              <li className="flex gap-2"><span className="text-primary font-black mt-0.5">→</span> <span><strong>Parental control:</strong> Parents may review, modify, or delete a minor&apos;s data at any time via the Parent Dashboard or by emailing us</span></li>
            </ul>
            <p className="mt-3 text-sm">To exercise any right, email <a href="mailto:privacy@spendxp.app" className="text-primary underline font-bold">privacy@spendxp.app</a>. We will respond within 30 days.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">9. Security</h2>
            <p className="text-sm">We protect your data using industry-standard measures: HTTPS/TLS encryption in transit, Firebase Security Rules restricting database access, bcrypt-hashed passwords (via Firebase Auth), and regular security reviews. No system is completely secure — if you discover a vulnerability, please report it to <a href="mailto:security@spendxp.app" className="text-primary underline">security@spendxp.app</a>.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">10. Cookies &amp; Tracking</h2>
            <p className="text-sm">SpendXP uses essential cookies only (session management, authentication). We do not use advertising cookies, third-party tracking pixels, or analytics cookies that identify individual users. Our anonymised analytics use aggregate, non-personal data only.</p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">11. International Users</h2>
            <p className="text-sm">SpendXP serves users in India, the United States, the United Kingdom, China, Japan, Russia, South Africa, and Sudan. Your data is stored on Google Firebase servers (primarily in the US and/or nearest Google Cloud region). By using SpendXP, you consent to this data transfer. We apply the highest applicable privacy standard (COPPA, DPDP, UK GDPR, PIPL) regardless of your country.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">12. Changes to This Policy</h2>
            <p className="text-sm">We may update this policy as the app evolves. We will notify registered users by email at least 14 days before material changes take effect. Continued use of SpendXP after changes constitutes acceptance of the updated policy. Parents will be re-notified for any material changes affecting how we handle children&apos;s data.</p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">13. Contact Us</h2>
            <div className="text-sm space-y-1">
              <p>For privacy enquiries, data requests, or parental consent issues:</p>
              <p>📧 <a href="mailto:privacy@spendxp.app" className="text-primary underline font-bold">privacy@spendxp.app</a></p>
              <p className="text-slate-400 text-xs mt-2">We aim to respond to all enquiries within 5 business days and resolve all requests within 30 days.</p>
            </div>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
          <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="/dashboard" className="hover:text-primary transition-colors">Back to App</a>
        </div>
      </div>
    </div>
  );
}
