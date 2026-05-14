# SpendXP — Professional Handoff Document

**Version:** 0.2.0  
**Prepared:** May 2026  
**Owner:** Amitha P  

---

## What Is SpendXP

SpendXP is a financial literacy app for teenagers and young adults (14–25). Users earn XP by completing financial Case Files (quests), playing arcade games, and maintaining daily streaks. The narrative is built around "The Order of the Golden Ledger" — a secret organisation that fights financial ignorance ("the Gray Fog").

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom CSS variables |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Vercel |
| Package manager | pnpm |
| Node version | 20+ |

---

## Repository Structure

```
src/
  app/              — Page routes (Next.js App Router)
    dashboard/      — Main user dashboard
    quests/         — Case File quest system
    games/          — Arcade games hub
    tools/          — Financial calculators
    learn/          — Lessons and learning hub
    resources/      — Curated external resources
    profile/        — User profile and settings
    story/          — Order of the Golden Ledger lore
    upgrade/        — Premium subscription page
    onboarding/     — First-run flow (avatar, country, age)
    login/          — Sign in
    signup/         — Create account
    forgot-password/— Password reset
    verify-email/   — Email verification gate
    consent/        — Parental consent (under-16)
    privacy/        — Privacy Policy
    terms/          — Terms of Service
    not-found.tsx   — Custom 404

  components/       — Shared UI components
    games/          — Individual game implementations
    onboarding/     — Intro slides, tooltip tour
    ui/             — shadcn/ui primitives
    AvatarDisplay   — Avatar image + fallback component
    PremiumGate     — Premium lock overlay
    BugReportButton — In-app bug report
    OfflineBanner   — Offline detection banner

  config/           — App-wide constants (no Firebase calls)
    avatars.ts      — 12 avatar character definitions
    currency.ts     — 8 country/currency configs with PPP balances
    narrative.ts    — Rank system, Gray Fog enemies, story text
    premium.ts      — Premium features and tier definitions
    xpConfig.ts     — XP awards per activity

  context/
    AuthContext.tsx — Firebase Auth state + Firestore profile fields

  hooks/
    usePremium.ts   — Premium status check
    useProgression.ts — XP, rank, streak data
    useCurrency.ts  — Currency formatting

  lib/
    firebase.ts     — Firebase SDK init
    ageAdapt.ts     — Age group detection
    store.ts        — User global state

  data/
    lessons.ts      — Lesson content
    questBreakdowns.ts — Quest concept breakdowns
```

---

## Environment Variables

Create a `.env.local` file in the project root with:

```
# Firebase (get from Firebase console → Project Settings → Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

All variables prefixed `NEXT_PUBLIC_` are embedded in the client bundle — safe for Firebase config but NOT for secret keys.

---

## Firebase Firestore Schema

### users/{uid}
```
{
  displayName: string
  email: string
  age: number
  country: string
  currencyCode: string
  avatarId: string          — one of the 12 avatar IDs from config/avatars.ts
  isPremium: boolean        — set to true via Stripe webhook when billing is live
  createdAt: Timestamp
}
```

### users/{uid}/progression/stats
```
{
  totalXP: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: Timestamp   — for streak reset logic
  gamesPlayed: number
  questsCompleted: number
  lessonsCompleted: number
  virtualSavings: number
}
```

### users/{uid}/questProgress/{questId}
```
{
  completed: boolean
  completedAt: Timestamp
  score: number
  xpEarned: number
}
```

---

## Design System

### Colour Palette
```css
--primary:        hsl(153 47% 33%)   /* Sage green  #2E7D5A */
--primary-light:  hsl(153 40% 47%)   /* Light sage  #4EA07A */
--navy:           #1A1F2E             /* Dark navy   — backgrounds */
--background:     hsl(220 20% 97%)   /* Slate 50 */
--foreground:     hsl(222 47% 11%)   /* Slate 900 */
```

### Typography
- Font: Inter (Google Fonts)
- Body weight: 500 (medium)
- Headings: 900 (black)
- Labels/badges: 700–900 uppercase + tracking-widest

### Spacing
- Cards: `rounded-2xl` or `rounded-3xl`, `p-6 md:p-8`
- Inputs: `h-11 rounded-xl px-4`
- Buttons: `h-10 px-6 rounded-xl font-black uppercase tracking-widest`

---

## Avatar System

### Current State
12 characters defined in `src/config/avatars.ts`. The avatar picker and profile display use the `AvatarDisplay` component which:
1. Tries to load `/public/avatars/{id}.png`
2. Falls back to a gradient circle with the character's initial letter

### Adding Real Avatar Art
1. Generate 200×200 PNG images (transparent background recommended)
2. Place files in `/public/avatars/` using these exact filenames:
   - `rocket.png`, `fox.png`, `owl.png`, `panda.png`, `dragon.png`, `robot.png`
   - `cat.png`, `ninja.png`, `unicorn.png`, `bear.png`, `lion.png`, `shark.png`
3. Deploy — the app picks them up automatically with no code changes needed

### AI Generation Prompts (for Gemini Image / Midjourney / DALL-E)

Use these prompts to generate all 12 avatars in a consistent style. Request all 12 in a single batch prompt:

**Style guide to include in every prompt:**
> "Flat vector illustration style, bold outlines, minimal detail, vibrant colours on a transparent background, 200x200 pixels, character should be a cute stylised animal/character with a friendly expression, suitable for a financial literacy app for teenagers."

**Individual character prompts:**
1. **Rocket** — A small cartoon rocket ship with a smiling face, blue and silver, with flame trail, flat illustration
2. **Fox** — An orange and white fox face with clever expression, flat vector style
3. **Owl** — A round amber-coloured owl with large round glasses, wisdom pose
4. **Panda** — A white and black panda face, gentle calm expression
5. **Dragon** — A friendly emerald green dragon, treasure chest nearby
6. **Robo** — A round-headed robot with glowing blue eyes, coin slot on chest
7. **Neko** — A pink cartoon cat with curious expression and coin in paw
8. **Ninja** — A dark-clad ninja character (non-threatening), one coin balanced on finger
9. **Uni** — A pastel purple unicorn with sparkle mane, magical expression
10. **Bruno** — A honey-brown bear cub holding a piggy bank
11. **King** — A proud golden lion with small crown, confident expression
12. **Jaws** — A blue cartoon shark grinning, dollar sign on fin

---

## Premium System

### How It Works
- `src/config/premium.ts` defines 9 premium features
- `src/hooks/usePremium.ts` reads `user.isPremium` from AuthContext
- `src/components/PremiumGate.tsx` wraps locked content with blur + upgrade CTA
- `/upgrade` page shows feature comparison + waitlist form

### To Enable Premium for a User (Manual — Pre-Stripe)
Set `isPremium: true` on the user's Firestore document:
```
Firebase Console → Firestore → users → {uid} → Edit → isPremium: true
```

### To Wire Real Billing (Stripe)
1. Create a Stripe product + price (TBD — set once pricing is confirmed)
2. Build a Stripe webhook endpoint (`/api/webhooks/stripe`)
3. On `customer.subscription.created` / `updated`: set `isPremium: true` in Firestore
4. On `customer.subscription.deleted`: set `isPremium: false`
5. No frontend code changes needed — `usePremium.ts` already reads from Firestore

---

## Key Features Implemented

- Firebase Auth (email/password + Google Sign-In)
- Age-adaptive content (Junior/Teen/Senior modes)
- Multi-currency support (8 countries, PPP-adjusted amounts)
- XP and rank progression system (7 ranks: Apprentice → Legend)
- 3 free games: Budget Blitz, FinIQ Quiz, Money Maze
- 2 premium games (locked): Stock Market Sim, Credit Builder
- First-run onboarding: intro slides + tooltip tour
- Daily streak tracking
- Case File quest system with XP rewards
- Order of the Golden Ledger narrative layer
- Privacy Policy + Terms of Service pages
- Custom 404 page
- Offline detection banner
- Bug report button

---

## Known TODOs Before App Store Launch

1. **Stripe billing** — all API routes built; set STRIPE_SECRET_KEY + STRIPE_PRICE_ID + STRIPE_WEBHOOK_SECRET in Vercel env vars once pricing is confirmed. See STRIPE_SETUP.md.
2. **Real avatar images** — place PNG files in `/public/avatars/` (see AI prompts above)
3. **Push notifications** ✅ Built — `/api/notify/streak` fires via Vercel Cron daily at 7 PM IST. Add `NOTIFY_CRON_SECRET` env var in Vercel.
4. **Daily quest limit** ✅ Built — enforced server-side in `/api/quests/complete`
5. **Streak backend logic** ✅ Built — server-side IST calendar-day comparison in `/api/quests/complete`
6. **Group Play** — currently "Coming Soon" / waitlist; needs multiplayer implementation
7. **App Store assets** — `resources/icon.png` and `resources/splash.png` are placeholder. Replace with final 1024×1024 PNG art. Run `npx @capacitor/assets generate` to auto-generate all iOS/Android sizes. See APP_STORE_METADATA.md for full screenshot guide.
8. **Capacitor** ✅ Configured — see MOBILE_SETUP.md for step-by-step build guide. `resources/icon.png` and `resources/splash.png` are ready for `npx @capacitor/assets generate`.
9. **Password reset** ✅ Fixed — `/reset-password` now uses Firebase `confirmPasswordReset()`. Set custom action URL in Firebase Console → Auth → Templates → Password Reset → `https://spendxp.vercel.app/reset-password`
10. **App Store metadata** ✅ Written — see APP_STORE_METADATA.md for full copy, keywords, screenshot guide, and pre-launch checklist
11. **Universal Links (iOS)** ✅ File at `public/.well-known/apple-app-site-association`. Replace `TEAM_ID_HERE` with your Apple Developer Team ID (found in Apple Developer Portal → Membership). Vercel serves this automatically.
12. **Android Deep Links** ✅ File at `public/.well-known/assetlinks.json`. Replace `REPLACE_WITH_YOUR_KEYSTORE_SHA256_FINGERPRINT` with your upload keystore SHA-256 (from Google Play Console → Setup → App integrity).
13. **Local streak reminder** ✅ Built — fires at 7 PM device-local time; auto-cancelled when user completes a quest or game. Requires `@capacitor/local-notifications` (already in package.json).

---

## Local Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in Firebase config values

# Start dev server
pnpm dev

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## Contact

**Owner:** Amitha P  
**Email:** amithap860@gmail.com  
**Live App:** https://spendxp.vercel.app  
**Repository:** GitHub (private)

---

*This document was prepared for professional developer handoff. Share along with the repository access and Firebase console credentials.*
