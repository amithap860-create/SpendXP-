export const metadata = {
  title: 'Delete your account | SpendXP',
  description: 'How to delete your SpendXP account and personal data.',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Delete your SpendXP account</h1>
          <p className="text-muted-foreground mt-2 text-lg">SpendXP · com.spendxp.app</p>
        </div>

        <section className="bg-card rounded-2xl border border-border p-6 space-y-3 text-foreground leading-relaxed text-base">
          <h2 className="text-2xl font-black">Delete it yourself, in the app</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Open SpendXP and sign in.</li>
            <li>Go to <strong>Profile</strong> and scroll to <strong>Delete Account</strong>.</li>
            <li>Type <strong>DELETE</strong> (and your password, if you use one) and confirm.</li>
          </ol>
          <p>Your account and data are removed immediately.</p>
        </section>

        <section className="bg-card rounded-2xl border border-border p-6 space-y-3 text-foreground leading-relaxed text-base">
          <h2 className="text-2xl font-black">Can&apos;t get into the app?</h2>
          <p>
            Email <a className="underline font-bold" href="mailto:spendxp.app@gmail.com?subject=Delete%20my%20SpendXP%20account">spendxp.app@gmail.com</a> from
            the address on your account with the subject &quot;Delete my SpendXP account&quot;. If the account belongs to a child under 13, the parent or guardian should write.
            We delete the account within 30 days.
          </p>
        </section>

        <section className="bg-card rounded-2xl border border-border p-6 space-y-3 text-foreground leading-relaxed text-base">
          <h2 className="text-2xl font-black">What is deleted</h2>
          <p>
            Your profile, XP, ranks, lesson, quest and game progress, scores, leaderboard entry, savings goals, activity history,
            AI chat threads, support and bug reports, parent/child links and invites, and your sign-in account.
          </p>
          <h2 className="text-2xl font-black pt-2">What we keep</h2>
          <p>
            Payment records for Pro subscriptions (amount, date, order ID) are kept for tax and fraud-prevention rules. They
            contain no learning or profile data. Backups are overwritten within 30 days.
          </p>
        </section>
      </div>
    </div>
  );
}
