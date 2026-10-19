# SpendXP Changelog

Running log of real fixes and changes, kept so you have something concrete to paste into the Play Console readiness questionnaire or release notes. I'll keep adding to this as we go — tell me any time you want the latest entries read out or copied somewhere.

## Tester feedback log (bugReports) - status as of 2026-10-15

Marked `resolved` in Firestore on 2026-10-15 (11 of 17): Peter Lynch lesson/quiz crash or not loading x4 (10, 12, 21, 21 Sep; lesson confirmed working), Stock Sim stuck at Day 2 x2 (11, 26 Sep; fixed 26 Sep), Budget Blitz rent shown as "$12" (21 Sep; fixed 28 Sep), Budget Blitz score mismatch (21 Sep; fixed 28 Sep), Money Maze can't drag (21 Sep; replaced with Up/Down buttons), Profile Level Progress colour (7 Oct; card removed), junk "testing" report.

UPDATE 2026-10-15 (after merge to main, Vercel Ready on 95e44ee): the 4 quest/Budget Blitz reports below are now `resolved` too (15 of 17). The last two (sign-in forgotten 5 Sep; Stock Sim slow load 11 Sep) were also set to `resolved` on AP's call that they are not problems (no code cause found; not reproduced). All 17 are now `resolved`.

Originally left `new` on purpose (6 of 17): quests not showing complete (12 Sep), same cases repeating (11 Sep), quest list jumps to top (12 Sep), Budget Blitz too fast at start (14 Oct) - fixed on branch feature/lesson-player, mark resolved once merged to main and live; signed out every time the app opens (5 Sep) - no code cause found, awaiting retest on v10; Stock Sim slow to load (11 Sep) - low priority, not changed.

## NEXT AAB (planned 1.1.3, not built yet) - release notes to use

Everything below shipped to testers via Vercel (web content) on merge of feature/lesson-player. The AAB itself only needs a version bump (versionCode 11 / 1.1.3) plus any native/shell changes; its Play release notes should still name these changes so reviewers see feedback being acted on.

Tie each item to tester feedback in the dated feedback log (bug reports 11-12 Sep quests, 14 Oct Budget Blitz speed, tester ask for more fun lessons / stock-movers topic).

Still to do before building 1.1.3: server-side fix for editable birth year on Profile; auth check on /api/consent-email; update Play Data safety form.

<en-US>
What's new:
- Lessons now play as short animated scenes with interactive charts
- New lesson: What Makes a Stock Move? (buybacks, inflation, interest rates)
- 9 new lessons and 100+ new quiz questions (credit, loans, scams, tax, retirement)
- Fixed quests not showing complete; retry if saving fails
- Case Files list keeps your place after a quest
- Budget Blitz starts slower so you can read the cards
- Calculator no longer gets stuck open in games
</en-US>

## 2026-10-15 - Lesson player redesign + "What Makes a Stock Move?" (branch feature/lesson-player)

- Lessons are no longer a card pager. Each card is now an animated SCENE that unfolds beat by beat (coach bubbles -> animated visual -> "in real life" bubble), then swipe-through fun facts, a quiz with pop/shake feedback and a reward screen with an XP count-up. Reduced-motion users get no animation. Data model unchanged, so all existing lessons work as-is.
- Visuals now animate and two are interactive: "comparison" asks you to guess which side is bigger before revealing; new "tug" (buyers vs sellers) lets you tap news events and watch the price pressure move; new "chain" shows cause -> effect. Fixed a bug where bars/comparisons with large values (e.g. 40,000 vs 9,375) rendered at thousands of percent height and showed "%".
- New lesson (26 total) after "The Power of Investing": What Makes a Stock Move? - supply and demand, expectations vs surprise (priced in), what a buyback is and why it can lift or drop a price, inflation and interest rates, and what moves a whole market. 14 matching quiz questions (218 total).
- Fixed: replaying a finished lesson paid full XP every time (now first completion only); backing out of the last unfinished lesson awarded the Scholar badge without finishing.

## 2026-10-15 - Content expansion and audit (web only)

- 8 new lessons (17 -> 25): Savings Accounts vs FDs, Loans & EMIs, Credit Cards, Spotting Scams, How Marketing Tricks Your Brain, Slabs/TDS/Filing, GST, Retirement (EPF/PPF/NPS). Inserted into the learn path where their vocabulary is already taught (existing completed lessons stay unlocked).
- 94 new FinIQ questions (110 -> 204), including 27 hard (hard 24 -> 51), matched to the new lessons: credit cards, loans/EMI, scams, tax, GST, retirement, inflation, harder investing maths.
- Fixed a factually wrong compound-interest statistic (was off 3-10x), removed an unsourced savings-rate statistic and an invented quote, corrected two crypto/market facts.
- Added an educational-use disclaimer and "content last reviewed" date on Learn, Quests hub and quest completion screens (config/content.ts).
- Full findings and remaining items: CONTENT-AUDIT.md.

## 2026-10-16 - Money Basics for Kids track + Parent Guide (branch feature/kids-track)

- 8 new junior-only lessons (ages 9-12), placed first on the junior path: What Is a Bank?, Goals and Saving, Budgeting and Smart Shopping, Sharing as Part of the Plan, The Money Snowball (compound interest), Where Does Money Come From?, Borrowing and Credit, Your Own Small Business. Teaching order follows the FDIC "Money Smart Basics for Kids" outline; all text, examples and numbers are original and in rupees. Earning is framed around pocket money, chores and family projects (no jobs for under-14s).
- New Parent Guide at /parent/guide ("Raising money-smart kids", linked from the parent nav): four habits (talk, daily life, saving, borrowing) by age stage, adapted in our own words from FINRA's "Financial Education for Kids" article with attribution and India-specific safety notes.
- Quiz review for the junior pool (42 -> 36 questions): deleted s-7 (answer key was wrong - labelled bulk buying as "Unit Pricing"), s-11 ("spending it all = poor planning", judgemental/ambiguous) and cq-90 (duplicate of nq-j-04); removed the junior tag from b-9 ("variable expense" jargon), i-10 (bonds) and t-8 (side-hustle tax - also clashes with the no-jobs-under-14 message). Question bank is now 215.
- Hidden from 9-12s (now teen/senior only): Short-Term Trading vs Long-Term Investing, Crypto & High-Risk Assets, Pick Stocks Like Peter Lynch - too advanced for the junior audience declared in Play. No game is gated on these lessons. Junior path is now 25 lessons, ending with ETFs & Index Funds.

## 2026-10-15 - Calculator stuck open (web only)

- Tester report: the quick calculator could not be closed when opened during a game. The open panel covered the floating button that was meant to close it. The floating button now hides while open and the panel has its own close (X) button. File: QuickCalculator.tsx.

## 2026-10-15 - Tester bug-report fixes (web only, ships via Vercel)

Triage of the 17 in-app bug reports (Firestore `bugReports`, 5 Sep - 14 Oct). Already fixed before this entry: Stock Sim stuck on Day 2 (2026-09-26, timer not restarted per round), Budget Blitz rent price and scoring (2026-09-28), Money Maze drag (replaced with Up/Down buttons), Level Progress colour (card removed 2026-10), Peter Lynch lesson crash (confirmed working by AP).

- Quests: finishing a case no longer lets you leave before the server save returns ("Saving your progress..." button), and a failed save now shows "Couldn't save your progress - tap to retry" instead of a false "Mission Success". Reports: "I keep finishing a quest but it doesn't show complete" (12 Sep), likely also "same cases again" (11 Sep).
- Quests: the Case Files list keeps its scroll position when you return from a case instead of jumping to the top. Report: 12 Sep.
- Budget Blitz: much slower start (first cards take ~9s to fall, was ~4.6s) with a gentler ramp. Report: 14 Oct.
- Still open: "signed out every time I open the app" (5 Sep) - no code cause found, asked tester to retest on 1.1.2.

## 2026-10-15 - Play release 1.1.2 (versionCode 10)

- SpendXP is now 9+ everywhere, matching the Play Console target-audience declaration (9-12, 13-15, 16-17, 18+). Signup age gate rejects under-9 birth years ("SpendXP is for ages 9 and up."), onboarding offers birth years for ages 9-20, validation, landing page, metadata, terms, privacy policy (page + public HTML), support pages, profile age check (was 8-25), manifest description and AI prompts updated.
- Includes the under-13 consent gate (branch feature/under13-consent-gate): onboarding flags under-13 accounts without parental approval and ConsentGuard keeps them on /consent until a parent approves.
- Known gap, not fixed here: Profile lets a user edit their birth year with no consent check, so a child could raise their age to leave the under-13 path. Needs a server-side rule (age may only change with re-consent or not at all).

### Play release notes - 1.1.2

<en-US>
Safer for younger players:
- Under-13 accounts now need a parent's approval before they can play
- SpendXP is now for ages 9 and up; age checks updated at sign-up and setup
- Clearer messages when a parent approval is pending
- Parent can approve from their email; child can tap "My parent approved" to continue
</en-US>

## 2026-10-12 (branch feature/under13-consent-gate, NOT yet on main)

- Closed an under-13 consent gap. Email signup already asked a parent for approval before creating an account, but web "Continue with Google" created the account first and went to onboarding with no age check, and onboarding let anyone pick any birth year 8-20. Now onboarding decides on the FINAL birth year: under 13 with no `consentGiven` -> account flagged `consentRequired`, child sent to /consent; a new ConsentGuard (mounted in the root layout) keeps flagged children there until the server-side approval API sets `consentGiven`. Existing accounts are untouched (no flag). Guard fails open on read errors; onboarding fails closed for children. /consent gained a "My parent approved - continue" check button.
- firestore.rules: `consentGiven` and `coppaConsented` are now protected fields (client can no longer self-approve). Rules must be deployed separately (firebase deploy --only firestore:rules); code works without it but a child could still self-approve until deployed.
- Known follow-up: /api/consent-email trusts the uid in the request body (no auth check), so anyone could trigger a consent email for any uid. Low impact, should be fixed with an ID-token check.

## 2026-10-10

- Android release build bumped to versionCode 9 / versionName 1.1.1 so the closed-testing track shows a fresh build, with a matched AAB + mapping.txt pair (build-release-aab.bat saves both as release-builds/spendxp-v9.*). No native code changed since versionCode 8; this build bundles the same shell, with `webContentsDebuggingEnabled` still false and minify on. Web changes since v8 (calculator, FinIQ no-repeat, quest expansion, unified ranks, service-worker kill switch) ship through Vercel and are not part of the binary.

## 2026-10-08

- Fixed the web app hanging on the loading screen in browsers that had visited an older build. Cause: an earlier version registered a service worker at /sw.js; that file no longer exists on the server, so browsers could never update the worker and it kept serving stale cached pages (reproduced: normal Chrome stuck, Incognito fine; DevTools showed sw.js received 22/08/2026 still running). Added public/sw.js as a kill switch: it replaces the stale worker, clears all caches, unregisters itself and reloads the tab once. The installed Android app was never affected (it strips service workers on startup).

## 2026-10-07 (progression)

- Profile: fixed Level Progress showing "8,340 / 7,500 XP" and an unreadable Money Master pill in light mode. The separate profile-only "level" ladder (Saver..Money Master) is now removed: there is ONE ladder, the Order ranks (Apprentice..Legend). Each rank carries a broader `title` (Saver, Investor, Banker, Tycoon) shown beside the rank name on the profile's Order card. Thresholds unchanged, so no player's rank changes.

## 2026-10-07 (later)

- Floating calculator (QuickCalculator): always-visible button + non-modal panel in FinIQ Quiz, Budget Blitz, Money Maze, Credit Score Builder and Quests, so players can work out the maths BEFORE answering. The timer keeps running while it is open.
- FinIQ Quiz:
  - +45 questions (15 per age group); pools are now junior 34 / teen 54 / senior 69.
  - Questions you've already seen are remembered on-device (per age group, last 200) and avoided until the pool is exhausted. Daily challenge unaffected.
  - Fixed: "Try Again" replayed the identical 10 questions and kept the old category stats.
  - Fixed: the round timer was seeded from question 1 only while the HUD showed the current question's time. Questions containing numbers now get +8s.
- Quests: all 8 formerly single-step quests (wants-vs-desires, smart-goal-setting, the-early-start, net-worth-checkin, sell-now-or-wait, emi-affordability-check, phone-emi, first-credit-card) now run 4 steps each, with xpReward +100 and estimatedMinutes 8. Already-completed quests stay completed (completion is idempotent), so existing players won't see the new steps on those.

## 2026-10-07

- Fixed the "Finance Scholar" badge popup (and confetti) replaying for a badge testers already owned, every time they opened a screen with the XP wallet. Not a re-award: the award code correctly refuses duplicates and never paid XP twice. The bug was in the celebration: the wallet compared your badges against an empty "previously seen" list on every load, so the first badge in your list always looked brand new. The first loaded snapshot is now treated as already-owned; only badges that appear afterwards trigger the popup. Trade-off: a badge earned moments before the wallet screen mounts (e.g. a quest finishing straight onto a results screen) may not pop up there, since it's already in the first snapshot — it still appears in Profile.

- Stock Market Sim, from tester feedback:
  - Ages 17-20 now trade 9 companies instead of 6: added Apex Global Bank (low risk), VoltDrive Motors (high risk), StreamWave Media (medium risk), each with 2 news headlines (one good, one bad). Teens still get the original 6 and juniors still get 3 — the new ones are flagged `seniorOnly` in stockMarketData.ts.
  - Every holding now shows the average price you bought at, plus your current gain/loss on it in rupee-free sim dollars and percent, on the stock card, in the mobile portfolio sheet, and in the sell dialog. The average was already being tracked internally (for the sell gain/loss pop) — it just was never displayed. Applies to all age groups.
  - Fixed a related bug: news headlines were picked from the full list regardless of which stocks you were actually trading, so juniors could see a headline about a stock they don't have (it moved nothing). Headlines are now drawn only from stocks in your game — which also stops teens/juniors being shown the new senior-only companies' news.
- Not touched: the sim still shows hardcoded "$" instead of the currency system (pre-existing; it's a sim-dollar game), flagging it as a known inconsistency with the app's "never hardcode currency" rule.

## 2026-10-05

- Second pass at the ~1 second app-open lag that survived the 09-30 login fix. Web-only changes (ship via Vercel, no new AAB):
  - Dashboard: the daily-rank query was awaited serially AFTER the main parallel data load and BEFORE the loading skeleton cleared — a second full uncached network round trip (Firestore is on memoryLocalCache) blocking the whole screen behind a widget that only feeds a subtitle. Now runs in the background and fills in when ready.
  - Root layout: the bug-report button and AI chat widget were statically imported, so their code was part of the JS every launch had to fetch/parse/hydrate before the splash could hide. Now lazy-loaded (client-only) after first render.
  - Splash fade-out shortened 300ms -> 120ms.
  - Not verified on a device: no before/after numbers yet. The `[perf]` console timings from 10-02 are still in place to measure it.
- Not changed (native, would need a new AAB): `launchShowDuration: 1800` in capacitor.config.ts. Believed to be only a ceiling (JS hides the splash earlier once hydrated), so lowering it should only matter on slow loads. Don't rebuild for it until the timings show the splash is actually the bottleneck.
- Fixed build-release-aab.bat naming output `spendxp-vnot.aab`: its findstr used a space inside the pattern, which findstr treats as OR, so a comment line overwrote the version number with the word "not". Now anchored to the real `versionCode N` line and aborts the copy if it can't read one.
- Untracked release-builds/ from git (an AAB and a 64k-line mapping file had been committed by mistake) and gitignored it.

## 2026-10-02

- Found and fixed the real reason "Saved Virtually" was stuck at 0 for every tester, even after the 2026-09-30 fix and even on brand-new quest completions — my earlier theory (that it just needed a backfill for old accounts) was wrong; this was a logic bug in the fix itself. The server was computing the stat as `Math.max(0, totalWalletDelta)` — the positive-clamped sum of the WHOLE quest's net cash flow. Almost every quest's net total is negative even on the best possible path (you're still paying rent, an EMI, a laptop — just less badly than the worse options), so that total got clamped to 0 on nearly every quest completion, for everyone, regardless of how well they played. Fixed by having the client track and send the sum of only the POSITIVE individual choice moments as they happen (`useQuestEngine.ts`'s new `totalPositiveWalletDelta`), instead of letting the server derive a flawed version from the already-negative quest total. A quest with one "+500 you saved" choice and one "-2000 you paid rent" choice now correctly contributes +500 instead of 0.
  - Caveat worth knowing: quest completion is idempotent (replaying an already-completed quest is a no-op, by design, to prevent XP farming) — so this fix only affects quest completions from today onward. Anyone who already finished most/all quests before today won't get retroactive credit for those specific past completions; it starts counting correctly from their next new (or not-yet-completed) quest. Given testers are still working through recently-added content, this should start climbing again quickly for most people. No backfill attempted — there's no stored per-choice history to reconstruct an exact number from, only a rough approximation would be possible, and it wasn't worth the risk for a cosmetic dashboard stat.
- Increased difficulty on the 5 quests exclusively tagged for the Senior age group (17-20), per direct feedback from an 18-year-old tester that quests were "good but could be more challenging." Scoped to senior-only quests specifically so teens (13-16) aren't affected, since quests don't support per-age-group text variants the way lessons do — any quest shared between teen and senior would get harder for both groups if touched.
  - **The Pink Slip Surprise** (emergency-expense): was a single step with two of three choices both marked "correct" and no real trade-offs (every choice paid the same severance regardless of what you picked). Rebuilt into 2 steps with exactly one correct answer each: the real decision now requires weighing cost-cutting vs. lifestyle vs. freelancing with actual runway math, then a second step adds a believable instant-loan temptation mid-unemployment. Bumped from intermediate to advanced.
  - **The Rewards Trap** (first-credit-card): same double-optimal problem (both the cash options were flagged correct). Added a real constraint — a new job starting in 2 weeks that the laptop is actually needed for — so "wait 3 months" is no longer free credit as a safe answer; now there's exactly one choice that doesn't create a new problem.
  - **Your First Apartment** (first-apartment): the rent-choice step used to state the exact percentage-of-salary math in the result text, telling the player the right answer instead of requiring them to work it out from salary and rent. Removed the spoon-fed percentages from the choice text (moved the full math to the post-choice explanation only). Also fixed a second double-optimal step (negotiating the agent fee vs. finding a no-fee listing were both marked correct) by adding a real 10-day move-in deadline that the no-fee search genuinely risks blowing.
  - **Right On Time** (right-on-time): was a clean 2-choice-per-step design, which meant every decision was a 50/50 guess rather than a real judgment call. Added a third, more tempting "I'll start once I have a real amount" option to the opening choice — a procrastination trap dressed up as prudence, which is a more realistic distractor than the original's stark "give up vs. start now" binary.
  - **The Math of Money: Projections** (calculations-quest) was left unchanged — already single-correct-answer, already using real compounding/tax/EMI math, already the strongest of the 5. No action needed.
- Investigated the residual ~1 second app-open lag reported after the login-lag fix above had already shipped (testers/developer confirmed it's still there). Found and fixed one real, always-on cause: `useNativeInit.ts` was waiting a flat, unconditional 400ms after mount before hiding the native splash screen, on every single launch, regardless of how fast the device/network actually was — pure padding left over from an early "give React a beat to hydrate" guess that was already true by the time that effect could even run. Replaced with a single animation-frame wait so the splash comes down as soon as content is actually on screen. Also added temporary `console.time` instrumentation (splash timing in useNativeInit.ts, auth-resolve timing in AuthContext.tsx) so the next test gives real on-device numbers via chrome://inspect instead of more guessing — remove this instrumentation once the lag is confirmed gone or the real remaining cause is found. NOT yet touched: the deliberate service-worker teardown in native.ts (disableServiceWorkerIfNative) and the native splash's own `launchShowDuration: 1800` in capacitor.config.ts — the former is high-risk to change (removing it previously caused a worse app-hang bug), the latter requires a new AAB since it's compiled into the native layer, not shipped via Vercel. Test this round before touching either.
- Fixed the login lag testers reported. Root cause: the whole app was waiting for a second, uncached Firestore network round-trip (on top of the Firebase Auth check) before it would clear the splash screen — Firestore's local cache is intentionally disabled here to avoid a separate known crash bug, so that read had to hit the network fresh on every single app open. Not a "need a bigger server" problem — the app now clears the splash screen as soon as Firebase Auth itself resolves (which is fast and locally cached), and profile fields like currency/premium status still update live moments later without blocking the screen.
- Added a user-assigned daily reminder time (Profile → Daily Reminder), replacing the fixed 7 PM reminder every user was stuck with. Requested directly in tester feedback.
- Strengthened the non-INR currency disclaimer, as a deliberate stopgap before internationalizing the curriculum properly. Previously the lesson banner only warned that rupee amounts hadn't been converted to the user's currency — it now says plainly that the underlying rules (tax brackets, deposit insurance limits, lending guidelines) are India-specific and may not match the user's actual country, since converting the number was never going to fix that. Quests didn't have any such warning at all — they already auto-convert ₹ amounts to the user's currency, which risked implying the whole scenario was localized when only the number was. Added a matching disclaimer there too, worded for the fact that quest numbers ARE converted but the regulations behind them aren't. Both banners were also using hardcoded amber-50/amber-200/amber-800 colors that don't adapt to dark mode (same bug class fixed everywhere else in the app) — switched to the existing cat-want token.
- Added a second batch of new content, this time from more advanced finance-basics material. Most of what was supplied was written for a US audience with US tax-advantaged accounts (401k/IRA-style "asset location," a 36% DTI mortgage number, Treasury-bill tiering) — none of which exists or works the same way in India, so it was deliberately left out rather than force-fit. Cut entirely: Asset Location Strategy, Tax-Loss Harvesting as a full lesson, the US 36% DTI figure, Treasury-bill "dry powder," and "cash-flow velocity" (jargon, not a real teachable concept). Built instead, adapted to the actual Indian system:
  - **Take-Home Pay: What You Actually Get** (new lesson chapter): CTC vs. gross vs. net pay, and why budgeting off the offer-letter number instead of the real payslip number is a common first-job mistake.
  - **Net Worth: The Real Scoreboard** (new lesson chapter + new quest "The Net Worth Check-In"): assets minus liabilities as the real measure of financial position, independent of income — placed right before the Investing chapter as a capstone.
  - **Give Every Rupee a Job** (new card in the Budgeting chapter): zero-based budgeting as the step up from 50/30/20.
  - **What Return Are You Really Keeping?** (new card in the Compounding chapter): real return after inflation and tax, not just the headline percentage.
  - **The Tax Difference Between Trading and Investing** (new card in the Short-Term Trading chapter + new quest "Sell Now or Wait It Out?"): actual current (2026) Indian equity capital gains rates — 20% STCG under 12 months, 12.5% LTCG after, with the first ₹1.25L/year exempt. Flagged in the code as a rate that changes with the Union Budget and needs re-checking before reuse in future years.
  - **How Much EMI Can You Actually Afford?** (new card in the Debt chapter + new quest "How Much Loan Can You Actually Handle?"): India's actual lending heuristic (FOIR — Fixed Obligation to Income Ratio), not the US DTI number.
  - New quests appended as chapters 25-27 and wired into the district/fog-enemy narrative system.
- Added new content sourced from SEBI Investor Education's personal finance material (the other 2 resources given — a microfinance company blog and a mutual fund site — turned out too thin or blocked to use; Investopedia's guide was inaccessible entirely). 3 genuinely new concepts the app never taught before:
  - **Needs, Wants & Desires** (new lesson chapter + new quest "The Festival Shopping List"): the 3-tier spending priority ladder — extends the existing Needs/Wants/Savings split with the "Desires" tier (aspirational purchases most likely to get funded by debt).
  - **Setting SMART Financial Goals** (new lesson chapter + new quest "The Concert Ticket Countdown"): Specific/Measurable/Achievable/Realistic/Time-bound goal-setting, since the app taught HOW to split a budget but never how to set the goal it's working toward.
  - **The Power of Compounding** (new lesson chapter + new quest "Two Friends, Same ₹50,000, Different Timing"): compound vs simple interest, the Rule of 72/114/144 shortcuts, and the real cost of delaying investing — the mathematical foundation "start early" advice was always resting on without ever being explained.
  - All 3 lessons inserted into the existing locked curriculum order (Needs/Wants/Desires + SMART Goals after Budgeting, Compounding after Emergency Funds and before Debt). All 3 quests appended as chapters 22-24 and wired into the existing district/fog-enemy narrative system.
- Fixed the results screen under-reporting XP on 3 of 5 games (Credit Score Builder, FinIQ Quiz, Budget Blitz): the completion bonus was always correctly credited to the player's actual wallet, but the number shown on the results screen right after finishing never included it. Credit Score Builder was the worst case — it has no per-question XP at all, so it showed "You earned 0 XP" on literally every playthrough despite 150 XP landing in the wallet a second later. Fixed at the source (one shared hook used by all games) so the displayed number now always matches what actually gets credited.
- Wired the "Gray Fog" story into the actual app instead of just status cards: each of the 21 quests and all 5 games is now mapped to a real district and fog enemy based on its actual content (not just its generic chapter label — a couple of quests filed under the same chapter actually fight different enemies once you read what they're really about).
  - The quest briefing screen (which already had a "here's the threat" section built, but showed the same generic enemy for every single quest based on your rank) now shows the specific threat that quest actually fights.
  - Each quest card in the list shows which district and enemy it's set against.
  - Finishing a quest now closes with "You weakened [enemy]. [District] is a little safer" instead of just handing you XP with no story attached.
  - Each game's pre-game brief now names which threat it trains you to fight.
  - Did NOT rewrite the quests' internal scenario/choice text into detective voice — that's hundreds of tested strings across 21 quests, too large and risky to touch wholesale right now. This pass is the framing around each quest, not a rewrite of the quest itself.
- Fixed the dashboard's "Active Threat" / "Counter" fog-enemy cards using fixed light-only colors that the earlier dark-mode pass deliberately skipped (they looked like semantic warning/success colors, which the pass was told not to touch) — in dark mode these sat as washed-out pale cards on an otherwise dark screen.
- Found and fixed the real reason "Saved Virtually" stayed at ₹0 even after completing quests (a prior fix had already wired up the missing data path, but the number itself was wrong): it was reading a net-cash-flow figure that's floored at zero, and most quests are spending scenarios where even the smartest choice still costs money overall. Added a separate running total that only counts actual "you saved or gained money" moments, and pointed the dashboard and wallet screen at that instead.
- Fixed "Try Another" in Money Maze always dropping you into Portfolio Builder's raw allocation screen no matter which game you'd actually just finished (Debt Domino included). It now correctly restarts the same mode you were just playing.
- Fixed Debt Domino: debt names were getting cut off with "..." on phone screens (e.g. "Friend L…", "Education …") because the card layout crammed the name, balance, interest rate, and reorder buttons into one row with no room left. Restructured into two rows so the full name is always readable.
- Fixed Debt Domino and Portfolio Builder both showing "+0 XP earned" on the results screen no matter what you actually scored — the display was reading a value that this game never actually updates. Portfolio Builder had a second, separate bug on top of that: it was awarding exactly 0 XP every single playthrough regardless of score, now scored the same way Debt Domino already was.
- Added a "which lesson is this" intro before Debt Domino, Portfolio Builder, and Stock Market Sim start — matching what FinIQ Quiz and Budget Blitz already did. The content already existed in the app, it just was never shown before these three games.
- Stock Market Sim: added a persistent one-line reminder of how the game works (prices move on their own, trade anytime, day ends automatically) since user feedback was that the flow felt unclear. Also added a visible confirmation when you buy (previously only selling gave any feedback) and explicitly tagged which company a news headline affects instead of leaving the player to guess from the headline text.
- Rethought what "correct" feedback means for the two games where a simple right/wrong flash doesn't actually fit: Debt Domino (MoneyMaze) and Stock Market Sim.
  - Debt Domino previously gave zero feedback while dragging debts into order — only a verdict at the very end. Added a live "Avalanche %" / "Snowball %" match meter that updates with every move, using the exact same math as the final check so it can never disagree with the end result.
  - Stock Market Sim deliberately has no "correct" trade — prices are randomized, so no one can know the right move in advance. Instead of a fake correct/wrong judgment, added a real gain/loss pop when you sell a stock (based on what you actually paid vs. sold for), and an honest "if you'd never traded" comparison plus a "realized from trades" breakdown on the results screen — separating actual locked-in performance from paper gains on stocks you're still holding.
- Added a proper color system for games: one place (globals.css) now defines what NEED, WANT, SAVE, correct, wrong, and streak look like, in both light and dark mode. Previously these were decided ad hoc, differently, in multiple files — which is exactly how NEED and WANT ended up the same color. Wired into Budget Blitz (all 3 places it color-codes categories) and Credit Score Builder.
- Added game-feel polish to the FinIQ Quiz: a live streak flame counter during play (previously only shown at the end), a floating "+XP" pop on each correct answer, and a small confetti burst on correct answers (separate from the bigger celebration reserved for actual high scores, so that one doesn't get cheapened).
- Fixed FinIQ Quiz's correct/wrong answer highlighting and the "Learning Moment" explanation box: fixed light-hex colors that didn't adapt to dark mode, same root cause as the Daily Challenge card bug above.
- Fixed Budget Blitz: NEED and WANT swipe buttons were literally the same green color (copy-paste bug, not caused by dark mode) — WANT is now amber, matching the color the game already uses for WANT everywhere else.
- Fixed the "Daily Challenge" brief screen (ConceptBreakdown) not respecting dark mode at all — it used a hardcoded light-blue background and gray text baked into inline styles, which the earlier dark-mode pass couldn't reach because it only converts Tailwind classes. Now uses the same theme variables as the rest of the app.
- Fixed badges permanently stuck at 0: the code that awards a badge was writing it to a different Firestore document than the one every screen actually reads badges from. XP rewards landed correctly (which is why Total XP looked right), but the badge itself went nowhere visible. Already-earned badges should reappear next time the qualifying action is repeated.
- Full dark mode pass across ~57 files (pages, games, tools, nav, lesson/quest viewers): converted hardcoded light-only colors to theme-aware ones so dark mode actually looks right almost everywhere, instead of just the Profile page with broken contrast. A handful of screens were deliberately left alone because they're permanently dark or permanently light by design (landing page, some admin/celebration screens) — converting them would have made things worse, not better.
- Replaced the emoji icon on lesson "Did You Know?" cards with a plain icon, matching the rest of the app's visual style.

## 2026-09-29

- Reordered the entire lesson curriculum (Learn tab) from budgeting → saving → emergency fund → debt → credit → insurance → taxes → investing → ETFs → short-term trading → crypto → stock analysis. Previously investing/ETFs/crypto were unlocked before saving and bank basics — backwards for a hard-locked linear path.
- Fixed two lesson cards that used terms ("mutual fund", "index funds") before those terms were ever defined, as a side effect of the reorder above.
- Fixed a duplicate quest chapter number (two unrelated quests both claimed chapter 9) and moved an advanced investing quest ("The Stock Investigator") out of the beginner section it was incorrectly sorted into.
- Added new lesson content: "Stocks vs. Bonds vs. Mutual Funds", "Value vs. Growth Investing", "What Does a Bank Actually Do With Your Money?", and "Leverage: Borrowing to Invest" — filling gaps where core financial terms were never actually taught.
- Fixed Stock Market Sim: a news headline's price effect was being re-applied every few seconds for an entire in-game day instead of once, causing prices to compound exponentially into unrealistic numbers (into the trillions on a run of good news).
- Slowed Stock Market Sim's trading days from ~20-35 seconds to 90 seconds per day, at user request, so headlines can actually be read before the day ends.
- Fixed Budget Blitz: cards that fell off the bottom of the screen (missed) were deducting a life but never counted against the end-of-game accuracy score — you could miss several items and still see 100% accuracy.
- Fixed Budget Blitz item pricing: every item in a price "bucket" (small/medium/large) shared one identical number regardless of what it was, so an Electricity Bill and a Gaming Mouse could show the same price. Every item now has its own realistic price.
- Fixed stale currency exchange rates used app-wide for every price display: the table was up to ~19% off from live rates (USD/INR alone had drifted from ~83 to ~96). Refreshed against live rates and removed a second, separately hardcoded copy of the same rate that would have silently drifted out of sync again.

## 2026-09-26 to 2026-09-28

- Added dark mode toggle (Profile page → Appearance). Infrastructure works app-wide; most individual screens still use hardcoded light colors and haven't been visually converted yet — this is tracked as follow-up work, not done.
- Fixed Debt Domino (Money Maze game): drag-and-drop was built with an API that doesn't work on touchscreens at all, so it never worked on a real phone. Replaced with Up/Down buttons.
- Fixed a bug shared across 4 games (Stock Market Sim, FinIQ Quiz, Credit Score Builder, Budget Blitz): the round timer could permanently freeze after round 1 due to a missing dependency in the shared timer effect.
- Confirmed removing 'unsafe-eval' from the Content-Security-Policy did not break Razorpay checkout — a real XSS-risk-widening setting removed with no loss of functionality.
- Added 3 new lesson cards and 1 new quest ("Promoter Buying Trap") sourced from real personal-finance content, after the original Instagram sources mostly turned out to be unextractable videos.
- Fixed a crash on the last card of the Peter Lynch stock-picking lesson caused by a data-shape mismatch.
- Fixed a quest color-contrast bug where correct and incorrect answers were rendered in the same shade of green.

## Earlier (pre-2026-09-26, carried over from prior sessions)

- Fixed achievements/badges not unlocking.
- Fixed the Financial Knowledge radar chart rendering blank.
- Fixed streak and "saved virtually" stats showing 0 incorrectly.
- Fixed quest case files that only had one selectable option.
- Fixed quests ending with ₹0 cash and inconsistent/unrealistic pricing.
- Fixed a Firestore security rules gap: the `parentUid` field was writable by clients when it should have been protected.
- Raised `minSdkVersion` from 22 to 24 and enabled code minification (`minifyEnabled`) for Play Store production requirements.

---
*Not included: internal refactors, dependency bumps, or anything with no user-visible or reviewer-visible effect.*

## 2026-10-16 — Answer-choice rebalancing (branch feature/kids-track)
- Rewrote options on 67 teen/senior FinIQ questions (shorter correct answers, no "always/never" or silly distractors); removed cq-58, cq-105 (weak). Bank = 213. Junior questions untouched (kept easy).
- Rewrote distractors on 12 lesson quiz cards (smart-goals, loans, credit-cards, scams, take-home, income-tax, stock-movers, etfs, crypto, saving).
- Quest choices and Credit Score Builder options now shuffle every time (optimal was first ~80–95% of the time).
- Not done: length-balancing of quest/credit-score option text.
- Add to 1.1.3 release notes: kids lessons, parent guide, harder quiz options.

## 2026-10-16 — Lesson reward flash
- Fixed reward screen briefly showing "+0 XP" on Finish (completion state now captured when the lesson opens).

## 2026-10-17 — Stock Sim contest mode
- /games?game=stockMarketSim&contest=stock1: fixed seed (same prices + headlines for everyone), $1,000, six core stocks, all age groups; one attempt per account (users/{uid}/gameScores/stockContest_stock1, written at start); result saved on finish. Honour-system: owner-writable doc, verify in Firebase console.
- Contest updated: 3 attempts, best counts; each attempt number has its own seed (same for all players). Doc fields: attemptsStarted, attempts.{n}, bestReturnPct/bestFinalValue/bestAttempt.

## 2026-10-18 — Dossier theme (branch feature/dossier-theme)
- Quests / Case Files screens: Yanone Kaffeesatz, midnight/ivory/gold via scoped .dossier class (layout.tsx loads font; globals.css holds theme). Rest of app unchanged.

## 2026-10-18 — Theme v2, app-wide
- Dark: midnight/ivory/gold. Light: warm ivory, charcoal text, forest-green primary, gold progress/rewards. Yanone Kaffeesatz everywhere; base 17px and minimum ~14px text.
- Tailwind palettes green/rose/amber/blue (+aliases) re-pointed at --p-* theme variables; hard-coded sage/slate hex and inline styles remapped; ~15 inline-style files and SVG strokes updated.
- Needs next AAB for: splash/background colour (#1A1F2E in capacitor.config.ts) and Play screenshots.
- Type scale raised again: text-xs 17px, sm 20px, base 23px (via tailwind fontSize so responsive variants work); arbitrary text-[9..16px] sizes mapped to 17-22px.

## 2026-10-18 — Contest leaderboard
- /contest-admin page + /api/admin/contest (admin SDK, requires users/{uid}.isAdmin). Lives outside /admin because middleware 404s /admin.

## 2026-10-19 — Story chapters (branch feature/story-chapters)
- 8 chapters, one per rank, unlock with rank (XP-derived). New: src/config/chapters.ts, ChapterReader, StoryChapters (on /story#chapters). Dashboard link now "Read Your Chapter"; quest briefing shows the chapter of its district. Arc: every Fog enemy is a hand of the Hollow Broker.

## 2026-10-19 — SpendCity map (branch feature/story-chapters)
- /city: areas = topics (Pocket Park [junior], Neighbourhood, Bank Row, World Gate, Central Hall, Market District, Academy), each held by a Fog villain. Level = 1 lesson + 1 case file; all levels done = area crime-free; next area opens. XP rank powers: Fog Sight, Pathfinder (Scout), Rank Clearance (Agent: open areas by rank). Config: src/config/cityMap.ts. Completion read from existing lesson tasks + questProgress; nothing new stored server-side. Entry: dashboard "City Map", quests page button.
- Level lessons follow the Learn tab order (contiguous runs of lessons.ts); do not reorder without checking.

## 2026-10-19 — Dashboard reorg + onboarding fix
- Dashboard: SpendCity map card (CityMapCard, shared useCityProgress hook with /city) now sits directly under the greeting, above the rank card.
- Fixed first-run overlap: HowToPlayModal auto-opened on top of the intro slides and the tooltip tour. Dashboard now runs intro slides -> tour only (HowToPlay opens from the ? button). Tour gets a City Map step first.
