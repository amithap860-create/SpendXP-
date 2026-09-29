# SpendXP Changelog

Running log of real fixes and changes, kept so you have something concrete to paste into the Play Console readiness questionnaire or release notes. I'll keep adding to this as we go — tell me any time you want the latest entries read out or copied somewhere.

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
