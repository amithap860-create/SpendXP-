# SpendXP — Master Context Document for Claude Code
# Save this file as CLAUDE.md in the root of the project
# Claude Code reads this automatically on every session

---

## WHAT YOU ARE BUILDING

SpendXP is a gamified financial literacy mobile app
for ages 8 to 20, targeting the Indian market first.
Users learn budgeting, saving, investing, credit,
taxes, and spending habits through games, quests,
lessons, and calculators.

LAUNCH PRIORITY:
1. Android app on Google Play Store — BUILD THIS FIRST
2. iOS app on Apple App Store — second phase
3. Web app (PC and browser) — third phase after mobile

THE DEVELOPER (the person you are helping) knows
nothing about coding. Explain everything in simple
plain English. Never assume technical knowledge.
When something needs to be done manually, give
step by step instructions with exact clicks.

---

## CURRENT STATE OF THE PROJECT

There is an existing codebase built in Next.js 15
with Firebase. It has working features but several
bugs that need fixing. The existing code should be
used as the foundation — do not start from scratch.

WHAT IS BUILT AND WORKING:
- 6 games: Budget Blitz, FinIQ Quiz, Money Maze,
  Stock Market Simulator, Credit Score Builder,
  Compound Clicker
- 7 quests with branching financial scenarios
- 8 lesson modules with interactive cards
- 4 financial calculator tools
- XP progression system with 5 levels and 19 badges
- Financial health score system (0-100)
- Parent dashboard with child monitoring
- Age adaptation system (Junior/Teen/Senior)
- Firestore security rules
- Currency system (INR default, 8 currencies)
- Glossary with 20 financial terms and formulas
- Resource hub based on 10 financial frameworks

KNOWN BUGS TO FIX (in priority order):
1. Rules of Hooks violation in dashboard page
   File: src/app/dashboard/page.tsx line 80
   Error: useState inside a conditional block

2. Account creation not working on landing page
   File: src/lib/store.ts and src/app/page.tsx
   Error: isInitialLoading stuck as true forever

3. isInitialLoading never resolves
   File: src/lib/store.ts
   Fix: add 3 second timeout fallback

4. Unclosed Card JSX tag
   File: src/app/parent/page.tsx
   Fix: find and close the unclosed Card component

5. OpenTelemetry missing module on Vercel
   File: next.config.ts
   Fix: add to serverExternalPackages and webpack
   externals

6. EmailSection crashes when user is null
   File: src/app/profile/page.tsx
   Fix: add null guard at top of component

7. CurrencySection crashes when profile is null
   File: src/app/profile/page.tsx
   Fix: add null guard with optional chaining

---

## MOBILE FIRST — ANDROID PLAY STORE LAUNCH

The immediate goal is to get SpendXP onto the
Google Play Store as an Android app.

The existing Next.js web app must be converted to
a mobile app using Capacitor. This is the recommended
approach because:
- It wraps the existing web code into a native app
- No need to rebuild everything in React Native
- Works on both Android and iOS from the same code
- The web version continues to work too

STEPS TO BUILD FOR ANDROID:

Step 1 — Install Capacitor:
  pnpm add @capacitor/core @capacitor/cli
  pnpm add @capacitor/android
  npx cap init SpendXP com.spendxp.app --web-dir=out

Step 2 — Configure Next.js for static export:
  In next.config.ts add:
    output: 'export'
    trailingSlash: true
    images: { unoptimized: true }

Step 3 — Build the web app:
  pnpm build

Step 4 — Add Android platform:
  npx cap add android

Step 5 — Sync files to Android:
  npx cap sync android

Step 6 — Open in Android Studio:
  npx cap open android

Step 7 — In Android Studio:
  Build → Generate Signed Bundle/APK
  Choose Android App Bundle (AAB) for Play Store
  Follow the signing key setup steps

ANDROID APP DETAILS TO USE:
  App name: SpendXP
  Package name: com.spendxp.app
  Version: 1.0.0
  Min SDK: 24 (Android 7.0)
  Target SDK: 34 (Android 14)
  Theme color: #0F6E56 (teal)

PLAY STORE REQUIREMENTS:
  The developer needs a Google Play Developer account
  Cost: $25 one-time fee at play.google.com/console
  Need: app icon 512x512px, feature graphic 1024x500px
  Need: screenshots of the app on different screen sizes
  Need: privacy policy URL (required for apps with auth)
  Need: content rating questionnaire (financial app)

---

## TECH STACK

Framework:     Next.js 15 App Router
Language:      TypeScript
Styling:       Tailwind CSS
UI library:    Radix UI + shadcn/ui
Database:      Firebase Firestore
Auth:          Firebase Auth
Build tool:    Turbopack
Package mgr:   pnpm
Dev port:      localhost:9002
Deployment:    Vercel (web), Android Studio (mobile)
Mobile:        Capacitor (wraps web app for mobile)

---

## FIREBASE PROJECT

Project ID:    studio-7609169345-afafa
Firestore:     Native mode, persistent local cache
Auth methods:  Email/Password, Google Sign-In
Rules file:    firestore.rules
Admin SDK:     src/lib/firebaseAdmin.ts (server only)
App Check:     reCAPTCHA v3 — production only
               DISABLED in development to prevent
               403 errors on localhost

CRITICAL: App Check debug tokens only work in
Firebase Studio. On localhost App Check must be
completely disabled. This is already configured
but do not re-enable it in development.

---

## ENVIRONMENT VARIABLES

These must exist in .env.local for local development
and in Vercel environment settings for production.
Never commit .env.local to git.

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_RECAPTCHA_SITE_KEY (production only)
FIREBASE_ADMIN_SDK_KEY (server only, JSON string)
NEXT_PUBLIC_APP_URL

---

## PROJECT FOLDER STRUCTURE

src/app/              All pages (Next.js App Router)
src/app/api/          Server API routes
src/components/       Reusable components
src/components/games/ All 6 game components
src/components/quests/Quest viewer and glossary
src/components/tools/ 4 calculator tools
src/components/parent/Parent dashboard components
src/hooks/            Custom React hooks
src/lib/              Utilities and Firebase init
src/data/             Static data files
src/config/           Currency and game amount config
src/context/          Auth and AgeGroup context
src/firebase/         Firebase barrel exports

---

## ALL APP PAGES AND ROUTES

/                     Landing page and login
/login                Sign in page
/signup               Create account
/onboarding           4 step setup after signup
/dashboard            Main user dashboard
/games                All 6 games hub
/quests               All 7 quests hub
/learn                8 lesson modules
/tools                4 financial calculators
/resources            10 framework resource hub
/profile              User settings and profile
/parent               Parent monitoring dashboard
/parent/setup         Parent onboarding
/consent              Parental consent for under 18
/verify-email         Email verification handler
/admin/security       Security monitoring (admin only)
/api/scores/submit    Score submission (server only)

---

## THE 6 GAMES

Budget Blitz
  Type: Arcade reflex
  How it works: Expense cards fall from top, player
  sorts into NEED / WANT / SAVE buckets
  Teaches: Spending decisions, needs vs wants
  File: src/components/games/BudgetBlitz.tsx
  Firestore: users/{uid}/gameScores/budgetBlitz

FinIQ Quiz
  Type: Scenario trivia
  How it works: Real life financial decision questions
  with 4 options, 15 second timer, streak tracking
  Teaches: All 5 financial topics
  File: src/components/games/FinIQQuiz.tsx
  Firestore: users/{uid}/gameScores/finIQQuiz
  Special: Daily challenge with shared leaderboard

Money Maze
  Type: Puzzle logic
  How it works: Two modes — Debt Domino (order debts
  by payoff priority) and Portfolio Builder (allocate
  investment across asset types with sliders)
  Teaches: Debt strategy, investing basics
  File: src/components/games/MoneyMaze.tsx
  Firestore: users/{uid}/gameScores/moneyMaze

Stock Market Simulator
  Type: Trading simulation
  How it works: Trade 6 fictional stocks over 5
  simulated days, news headlines affect prices
  Teaches: Buy low sell high, diversification
  File: src/components/games/StockMarketSim.tsx
  Firestore: users/{uid}/gameScores/stockMarketSim

Credit Score Builder
  Type: Strategy game
  How it works: 12 simulated months, choices raise
  or lower a virtual CIBIL score, goal is 750+
  Teaches: How credit scores work and what damages them
  File: src/components/games/CreditScoreBuilder.tsx
  Firestore: users/{uid}/gameScores/creditScoreBuilder

Compound Clicker
  Type: Idle clicker
  How it works: Click to save coins, unlock investment
  vehicles from piggy bank to stocks, time-lapse slider
  shows 40 years of compound growth
  Teaches: Compound interest, SIP, starting early
  File: src/components/games/CompoundClicker.tsx
  Firestore: users/{uid}/gameScores/compoundClicker
  Special: Uses localStorage for game state (not
  Firestore) to avoid writes on every click

---

## THE 7 QUESTS

File: src/data/quests.ts
Hook: src/hooks/useQuestEngine.ts
Component: src/components/quests/QuestViewer.tsx

Quests are multi-step financial story scenarios.
Each step has 3-4 choices. Choices affect XP and
Financial Health score. An optimal choice is marked
on each step.

Quest IDs and themes:
  first-paycheck         What to do with first salary
  first-apartment        Renting decisions and costs
  phone-emi              True cost of instalments
  emergency-expense      Why emergency funds matter
  vacation-planning      Saving vs borrowing for goals
  first-credit-card      APR, rewards, credit risk
  calculations-quest     Pure maths practice age adapted

Financial Health Score:
  Separate from XP. Starts at 50. Range 0 to 100.
  Good quest choices raise it, bad choices lower it.
  File: src/lib/financialHealth.ts
  Firestore: users/{uid}/progression/data
             .financialHealth
             .healthHistory (last 30 days)

---

## XP PROGRESSION SYSTEM

Levels:
  Saver        0 to 500 XP
  Investor     500 to 1500 XP
  Banker       1500 to 3500 XP
  Finance Pro  3500 to 7500 XP
  Money Master 7500 to 15000 XP

XP sources:
  Games: 10 to 300 XP per session
  Quests: 200 XP base plus bonuses
  Lessons: 30 to 60 XP per module
  Tools: 10 XP first use per tool
  Resources: 10 to 100 XP per card explored
  Badges: 50 to 200 XP each

All XP writes must go through:
  useGameEngine.endGame()
  → POST /api/scores/submit
  → Firebase Admin SDK server write
  NEVER write XP directly from browser to Firestore

Badges (19 total):
  First Win, 5-Game Streak, Budget Master,
  Debt Destroyer, Smart Investor, Tax Whiz,
  Daily Challenger, Speed Demon, Perfect Round,
  Finance Scholar, Emergency Fund Builder,
  Scam Spotter, Tool Explorer, Goal Getter,
  Financially Stable, Money Master, Maths Master,
  Framework Master, Family Linked

Badge service: src/lib/badgeService.ts

---

## AGE ADAPTATION SYSTEM

This is the most important feature of SpendXP.
Everything changes based on age group.

File: src/lib/ageAdapt.ts
Context: src/context/AuthContext.tsx (exposes
         currentAgeGroup — always recalculated live
         from birthYear, never stale)

Age groups:
  Junior  ages 8-12   pocket money scale ₹10-₹200
  Teen    ages 13-16  allowance scale ₹100-₹2000
  Senior  ages 17-20  salary scale ₹1000-₹20000

What changes per age group:
  Money amounts in all games and quests
  Vocabulary (pocket money vs salary vs CTC)
  Financial concepts shown (no tax for juniors)
  Quiz question difficulty
  Formula complexity in glossary
  Quest step complexity
  Lesson depth

Age group recalculates every session from birthYear.
If user has a birthday, group updates automatically.
Never hardcode age group — always read from context.

---

## CURRENCY SYSTEM

Default: INR with Indian number system
  ₹1,00,000 = 1 lakh (not ₹100,000)
  ₹10,00,000 = 1 crore
  Compact: ₹1L, ₹10L, ₹1Cr

File: src/config/currency.ts
Hook: src/hooks/useCurrency.ts
Amounts: src/config/gameAmounts.ts

CRITICAL RULES:
  Never hardcode ₹ or INR anywhere in components
  Always use useCurrency() hook for all money display
  All game amounts come from gameAmounts.ts only
  scaleAmount() converts INR to other currencies

8 supported currencies:
  INR, USD, GBP, EUR, AED, SGD, AUD, CAD

User's preferred currency stored in:
  Firestore: users/{uid} .currencyCode

---

## FIRESTORE DATA STRUCTURE

All collections and what they store:

users/{uid}
  displayName, email, birthYear, ageGroup,
  provider, currencyCode, parentLinked, parentUid,
  isParent, isAdmin, onboardingComplete,
  consentGiven, emailVerified, pendingEmail,
  interests, createdAt

users/{uid}/gameScores/{gameId}
  highScore, lastScore, xpEarned,
  gamesPlayed, lastPlayedAt

users/{uid}/progression/data
  totalXP, totalGamesPlayed, lastActivityAt,
  gameHighScores{}, badges[], level,
  walletBalance, financialHealth, healthHistory[]

users/{uid}/lessonProgress/{lessonId}
  completed, completedAt, xpEarned

users/{uid}/questProgress/{questId}
  completedAt, optimalChoiceRate,
  xpEarned, healthDelta, choiceHistory[]

users/{uid}/activityLog/{autoId}
  gameName, score, xpEarned, playedAt
  NOTE: immutable — no updates allowed

users/{uid}/savingsGoals/{goalId}
  name, targetAmount, savedAmount,
  targetDate, monthlyContribution

users/{uid}/virtualInvestments/{id}
  Stock sim portfolio data

users/{uid}/parentControls/limits
  dailyMinutes, lastUpdated

users/{uid}/resourceProgress
  exploredCards[], completedInteractions[],
  totalXPFromResources

leaderboard/{uid}
  uid, displayName, totalXP, updatedAt

dailyChallenges/{YYYY-MM-DD-IST}
  participantCount

dailyChallenges/{date}/scores/{uid}
  score, playedAt

linkRequests/{id}
  parentUid, childUid, status, createdAt

pendingParentInvites/{id}
  childUid, parentEmail, inviteCode, expiresAt

consentRequests/{uid}
  parentEmail, status, requestedAt

securityLog/{uid}/events/{id}
  type, details, timestamp, resolved

authAttempts/{email}
  attempts, lastAttemptAt, lockedUntil

---

## SECURITY RULES — CRITICAL

Firestore rules file: firestore.rules
Must be deployed with:
  firebase deploy --only firestore:rules

The rules use these helper functions:
  isSignedIn()     request.auth != null
  isOwner(uid)     request.auth.uid == uid
  isParentOf(uid)  reads child doc to check parentUid
  isAdmin()        reads user doc to check isAdmin
  isStudioPreview() sign_in_provider == 'custom'

IMPORTANT: The isStudioPreview() function allows
Firebase Studio's preview auth to bypass rules
during development. This is safe because custom
provider tokens never appear in real user sessions.

Current rules status: PUBLISHED in Firebase Console
If you get permission denied errors:
  1. Go to console.firebase.google.com
  2. Firestore → Rules
  3. Check rules are published not in draft
  4. If a new collection is missing, add a rule for it

---

## IMPORT RULES — NEVER BREAK THESE

Components, hooks, pages:
  import from '@/firebase'   (barrel file)

Service files in src/lib/:
  import from '@/lib/firebase'   (direct)

API routes in src/app/api/:
  import from '@/lib/firebaseAdmin'   (server only)

cn utility:
  import { cn } from '@/lib/utils'

Money formatting:
  import { useCurrency } from '@/hooks/useCurrency'
  NEVER import from any other path
  NEVER hardcode ₹ symbol

firebaseAdmin MUST NEVER be imported in any
client component. It will crash the browser bundle.
It is server-only.

---

## SAFE FIRESTORE WRAPPERS

Never use raw Firestore functions in components.
Always use these safe wrappers from firestoreSafe.ts:

  safeGetDoc(ref)           reads a document safely
  safeSetDoc(ref, data)     creates or overwrites
  safeUpdateDoc(ref, data)  updates existing doc
  safeOnSnapshot(ref, cb)   real-time listener

These wrappers:
  Handle permission denied errors gracefully
  Never crash the app on Firestore errors
  Log security events appropriately
  Return null instead of throwing on errors

---

## HOOKS RULES — REACT RULES OF HOOKS

This is the most common bug in this codebase.
ALWAYS follow these rules:

CORRECT:
  export default function PageName() {
    const [state1, setState1] = useState(false)
    const [state2, setState2] = useState(null)
    useEffect(() => { ... }, [])
    useMemo(() => { ... }, [])

    if (!state1) return <Loading />
    return <JSX />
  }

WRONG — never do this:
  export default function PageName() {
    if (someCondition) {
      const [state, setState] = useState(false)
    }
    return <JSX />
  }

Rules:
  All useState must be at the TOP of the component
  All useEffect must be at the TOP of the component
  All useMemo and useCallback at the TOP
  Never put a hook inside an if statement
  Never put a hook inside a loop
  Never put a hook after a return statement
  Conditional returns only AFTER all hooks

---

## DATE AND TIME — ALWAYS USE IST

India is UTC+5:30. All date calculations must use
Indian Standard Time not UTC.

File: src/lib/dateHelpers.ts

Functions to use:
  getISTDateKey()        returns YYYY-MM-DD in IST
  getNextISTMidnight()   next midnight in IST
  formatRelativeTime()   "2h ago", "yesterday" etc

NEVER use:
  new Date().toISOString().split('T')[0]
  This gives UTC date which is wrong for India

The daily challenge resets at midnight IST.
If UTC date is used, users see yesterday's challenge
for the first 5.5 hours of every day.

---

## CONFETTI — CUSTOM IMPLEMENTATION

canvas-confetti package has been removed because
it crashes with Turbopack.

Custom implementation is at: src/lib/confetti.ts
Uses only the browser Canvas API, no dependencies.

Functions to use:
  fireConfettiPersonalBest()   after beating high score
  fireConfettiBadgeUnlock()    when badge is earned
  fireConfettiGoalReached()    when savings goal done
  fireConfettiQuestComplete()  after finishing a quest
  fireConfetti(options)        custom options

NEVER import canvas-confetti. It is removed from
package.json. Using it will crash the build.

---

## MOBILE APP CONFIGURATION

For Android Play Store release:

capacitor.config.ts settings:
  appId: 'com.spendxp.app'
  appName: 'SpendXP'
  webDir: 'out'
  bundledWebRuntime: false

Android specific settings in
android/app/src/main/res/values/strings.xml:
  app_name: SpendXP

Splash screen color: #0F6E56 (teal)
Status bar color: #0F6E56 (teal)
Theme: Light mode default

Min Android version: 7.0 (API 24)
Target Android version: 14 (API 34)

Firebase for Android requires:
  google-services.json in android/app/
  Download from Firebase Console →
  Project Settings → Your Apps → Android app
  Package name must match: com.spendxp.app

Deep links for email verification:
  Must add SHA-1 fingerprint from Android Studio
  to Firebase Console → Android app settings

---

## PLAY STORE RELEASE CHECKLIST

Before submitting to Play Store:

Code:
  pnpm build passes with zero errors
  pnpm exec tsc --noEmit passes with zero errors
  All 7 known bugs are fixed
  App loads and works on Android emulator

Firebase:
  Firestore rules deployed and published
  Authentication enabled for Email and Google
  google-services.json downloaded and placed in
  android/app/ folder
  SHA-1 fingerprint added for release keystore

Android Studio:
  App signed with release keystore
  AAB (Android App Bundle) generated not APK
  Version code: 1
  Version name: 1.0.0

Play Console:
  Developer account created ($25 fee paid)
  App created in Play Console
  Internal testing track set up first
  AAB uploaded to internal testing
  Privacy policy URL added
  Content rating questionnaire completed
  App category: Education
  Target audience: Children and teens

Assets needed:
  App icon: 512x512 PNG
  Feature graphic: 1024x500 PNG
  Screenshots: minimum 2, at least one phone screenshot
  Short description: max 80 characters
  Full description: max 4000 characters

---

## PRIVACY POLICY REQUIREMENT

Google Play requires a privacy policy for apps
that collect personal data. SpendXP collects:
  Name and email address
  Birth year
  Game scores and progress
  Device information

A simple privacy policy must be hosted at a URL
before Play Store submission. Options:
  Create one at privacypolicygenerator.info
  Host it on your Vercel deployment at /privacy
  Or use a Google Sites page

---

## VERCEL DEPLOYMENT (WEB VERSION)

The web version deploys to Vercel automatically
when you push code to the main git branch.

Manual deploy:
  vercel --prod

Environment variables must be set in:
  Vercel Dashboard → Project → Settings →
  Environment Variables
  Add all variables from .env.local

Custom domain:
  Vercel Dashboard → Project → Settings → Domains
  Add spendxp.app or your chosen domain

---

## COMMANDS REFERENCE

Install dependencies:    pnpm install
Run locally:             pnpm dev
Build for production:    pnpm build
Type check:              pnpm exec tsc --noEmit
Clear build cache:       rm -rf .next
Deploy Firestore rules:  firebase deploy --only firestore:rules
Sync Capacitor:          npx cap sync android
Open Android Studio:     npx cap open android
Deploy to Vercel:        vercel --prod

---

## HOW TO HANDLE ERRORS

When you see an error:
1. Read the error message carefully
2. Note the file name and line number
3. Fix only that specific issue
4. Do not change other files unnecessarily
5. Run pnpm build after each fix to verify

Common errors and what they mean:

"Cannot read properties of null"
  A component is trying to read data before it loads
  Fix: add null guard at top of component
  if (!data) return null

"Rules of Hooks violation"
  A hook is inside a conditional block
  Fix: move all hooks to top of component

"Missing or insufficient permissions"
  Firestore rules are blocking a read or write
  Fix: check firestore.rules has a rule for that path

"Module not found"
  A package is imported but not installed
  Fix: pnpm add [package-name]

"Export X doesn't exist in target module"
  A function is imported from the wrong file
  Fix: check src/firebase/index.ts re-exports it

---

## DESCRIPTION FOR PLAY STORE

Short description (80 chars):
Learn money skills through games, quests and challenges

Full description:
SpendXP makes financial literacy fun for ages 8 to 20.

Learn real money skills through:
★ 6 engaging games including Budget Blitz, Stock Market
  Simulator, and Credit Score Builder
★ 7 real-life money quests covering rent, EMI, credit
  cards, emergencies, and your first paycheck
★ 8 short lessons on budgeting, investing, taxes and more
★ 4 calculators for EMI, SIP, compound interest and
  savings goals

Everything adapts to your age. Younger users learn
with pocket money examples. Older users tackle
salaries, tax slabs, CIBIL scores and SIP investing.

Earn XP, unlock badges, and track your financial
health score as you make better money decisions.

Parents can monitor progress, set time limits, and
get weekly reports.

Free to use. No ads. No in-app purchases.
Built for India. All amounts in Indian Rupees.

---

## CONTACT AND ACCOUNTS

Firebase Console:  console.firebase.google.com
Vercel Dashboard:  vercel.com/dashboard
Play Console:      play.google.com/console
Anthropic Console: console.anthropic.com

---

## FINAL NOTES FOR CLAUDE CODE

- The developer is a beginner. Explain every step.
- Always fix bugs before adding new features.
- Always run pnpm build after changes to verify.
- Mobile (Android) is the first priority.
- Web deployment is the second priority.
- Never break existing working features.
- When in doubt ask the developer what they want.
- Keep all amounts in INR unless user changes currency.
- All dates in IST timezone.
- All hooks at the top of every component always.