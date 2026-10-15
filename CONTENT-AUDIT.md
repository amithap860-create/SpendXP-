# SpendXP Content Audit — 2026-10-15

Scope: quests.ts, lessons.ts, finIQQuestions.ts, conceptBreakdowns.ts, creditChoices.ts, game components. Read-only audit of structure, age tags, currency handling and time-sensitive claims. **Not** a line-by-line fact-check of all 4,300 lines of quests.

## Fixed in this pass
- conceptBreakdowns `compound-interest` stat was wrong by 3–10x ("$600/month from 22 = $500,000 at 12%"). Recomputed: ~$1.77M at 8% (start 22), ~$749k (start 32).
- lessons.ts budgeting brief: removed an unsourced "under-25s save just 4%" statistic and an invented Buffett quote.
- lessons.ts: GME "1,700% in a week" corrected; Chainalysis "$8B in 2022" softened (could not verify the exact figure).
- 8 new lessons (25 total), 94 new quiz questions (204 total, hard 24 → 51), educational disclaimer + "content last reviewed" date on Learn, Quests hub and quest-completion screens.

## Still open
1. **Hardcoded "$"**: StockMarketSim.tsx (4 places — sim currency, should be labelled), creditChoices.ts (3 lines, Credit Score Builder), conceptBreakdowns.ts (3 stats). These bypass the currency localiser.
2. **Time-sensitive claims needing re-verification before use and after each Union Budget**: India STCG 20% / LTCG 12.5% with ₹1.25L exemption (lessons.ts ~1280), CTC/take-home/PF breakdown (~847), "₹96/$1" conversion note (budgetBlitzItems.ts), DICGC ₹5 lakh cap (new l-banking), EPF/PPF/NPS rules (new l-retirement), country tax data in countryFinance.ts (marked verified 2026-07-17).
3. **Junior coverage is thin**: only 5 quests tagged junior (4 junior-only + wants-vs-desires). Play target audience includes 9–12.
4. **Age fit**: quests tagged teen/senior only for credit/EMI topics (first-credit-card = senior only) — OK. Not yet checked: whether the *teen* group (13–16?) should see phone-emi / emi-affordability-check.
5. **Single "optimal" answer** on judgement-call quests (sell-now-or-wait, stock picks): consider showing "reasonable alternatives" rather than one correct answer.
6. All pre-existing FinIQ questions had `correctIndex: 0`; options are shuffled at runtime (FinIQQuiz.tsx), so this is fine — new questions follow the same convention.
