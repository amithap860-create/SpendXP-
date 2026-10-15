import type { Lesson } from './lessons';

/**
 * NEW LESSONS (2026-10-15) — content-audit expansion.
 *
 * Why: the library had 17 lessons, with credit and taxes at ONE lesson each,
 * while the FinIQ quiz already asked 21 credit and 17 tax questions. Testers
 * also reported running out of content. These 8 lessons fill the credit, tax,
 * saving and spending gaps and are inserted into the curriculum order in
 * lessons.ts (see LESSON_INSERTIONS there) so that every lesson only uses
 * vocabulary already taught before it.
 *
 * Number-checking: every figure below was computed (not estimated) —
 *  - Flat 12% for 2 yrs on ₹1,00,000: EMI ₹5,167, total ₹1,24,000; the same EMI
 *    on a reducing balance is a ~21.6% p.a. loan.
 *  - ₹5,00,000 at 8% p.a.: 3 yrs → EMI ₹15,668, interest ₹64,055; 5 yrs → EMI
 *    ₹10,138, interest ₹1,08,292; 7 yrs → EMI ₹7,793, interest ₹1,54,621.
 *  - ₹10,000 unpaid at 3.5% a month for 12 months → ₹15,111 (≈51% effective).
 *  - ₹5,000/month at an ASSUMED 8% p.a.: 35 yrs ≈ ₹1.15 crore, 25 yrs ≈ ₹47.6 lakh.
 *  - ₹1,180 incl. 18% GST = ₹1,000 + ₹180.
 *  - Illustrative slab example (0–3L nil, 3–7L 5%, 7–10L 10%): ₹9,00,000 income
 *    → ₹40,000 tax = 4.4% effective.
 * Rates, limits and deadlines that change (tax slabs, GST rates, PPF rate,
 * deposit-insurance cap) are deliberately NOT hard-coded as "today's number"
 * except where labelled illustrative or "as of 2026 — check the current rule".
 */
export const newLessons: Record<string, Lesson> = {
  // ───────────────────────── SAVING ─────────────────────────
  'l-banking': {
    id: 'l-banking',
    topic: 'saving',
    relatedGame: 'budgetBlitz',
    title: 'Savings Accounts vs Fixed Deposits',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'bk1',
        title: 'Where Should Your Savings Sleep?',
        body: {
          junior: "A bank keeps your money safe AND pays you a little extra (interest) for letting it use your money. A savings account lets you take money out any time. A fixed deposit (FD) makes you promise to leave it for a set time — and pays more for that promise.",
          teen: "A savings account is flexible: deposit and withdraw any time, earning modest interest. A fixed deposit (FD) locks your money for a fixed period at a fixed rate, usually higher than a savings account. The trade-off is liquidity — how quickly you can turn money into cash without a penalty.",
          senior: "Savings accounts offer full liquidity at a lower rate; FDs trade liquidity for a higher, fixed rate — breaking one early usually costs a penalty on the interest. The right split follows a simple rule: money you may need within months stays liquid; money you won't touch for a defined period can earn more in an FD."
        },
        example: {
          junior: "Piggy bank = you can open it anytime (savings account). A locked box with a timer = you can't open it until Diwali, but your parents add extra coins for waiting (fixed deposit).",
          teen: "₹1,00,000 for 5 years: at 3% in a savings account it earns about ₹15,900 in interest; at 7% in an FD it earns about ₹40,300. Same money — the FD pays more because you agree not to touch it.",
          senior: "Keep 3–6 months of expenses in a savings account (emergency fund). Put money for a known goal 2 years away — say a ₹3,00,000 down payment — in an FD matching that date, so it earns more without risking a forced early break."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Savings a/c @3% (5 yrs)', value: 15927, color: '#f59e0b' },
          right: { label: 'FD @7% (5 yrs)', value: 40255, color: '#10b981' },
          prefix: '₹'
        },
        xpReward: 20
      },
      {
        id: 'bk2',
        title: 'Is Your Bank Money Safe?',
        body: {
          junior: "Banks in India that are properly licensed are watched by the Reserve Bank of India (RBI). And there's even a safety net: if a bank fails, a government-backed insurer returns a part of your savings.",
          teen: "Deposits in banks are covered by DICGC deposit insurance up to a limit per depositor per bank (₹5 lakh as of 2026 — the limit has changed before, so check the current figure). That limit covers all your accounts in ONE bank combined — principal plus interest.",
          senior: "DICGC insures up to ₹5 lakh per depositor, per bank (as of 2026; verify the current cap), aggregated across savings, current, FD and RD accounts in that bank. Implication for larger balances: spreading deposits across banks keeps each balance within the insured limit. Only RBI-licensed banks qualify — a high-return 'deposit scheme' from an unlicensed entity has no such protection."
        },
        example: {
          junior: "Check that your bank has an RBI licence, the way you'd check a shop has a proper name board and licence.",
          teen: "You hold ₹3 lakh in an FD and ₹2.5 lakh in a savings account at the SAME bank = ₹5.5 lakh. If that bank failed, the insurance covers up to the limit — not the full ₹5.5 lakh.",
          senior: "₹12 lakh to park safely: ₹4 lakh each in three different banks keeps every deposit under the insured limit, instead of ₹12 lakh in one bank where only the cap would be covered."
        },
        visual: 'none',
        xpReward: 20
      },
      {
        id: 'bk3',
        title: 'Real Return: The Inflation Check',
        body: {
          junior: "Prices go up a little every year. If your bank pays you 6% but prices rise 6%, you can buy exactly the same stuff next year — your money didn't truly grow. It only grows if the bank pays MORE than prices rise.",
          teen: "Real return = interest rate minus inflation (roughly). An FD at 7% when inflation is 6% only grows your buying power by about 1% a year. Also, FD interest is taxable income, which can pull the real return even lower — so 'safe' doesn't always mean 'growing'.",
          senior: "Real return ≈ nominal rate − inflation, and tax comes out of the nominal interest first. ₹1,00,000 in an FD at 7% reaches about ₹1,96,700 in 10 years; if prices rise 6% a year, that ₹1,96,700 has the buying power of only about ₹1,09,800 today. Low-risk instruments protect capital; beating inflation over long periods usually needs some growth assets alongside them."
        },
        example: {
          junior: "A samosa costs ₹10 today. At 6% price rise it costs about ₹10.60 next year. Your ₹10 in the bank must grow to at least that to keep buying one samosa.",
          teen: "₹1,00,000 at 7% for 10 years → ₹1,96,715. But if prices rise 6% a year, the same basket of goods that costs ₹1,00,000 today costs about ₹1,79,085. Your 'gain' in real terms is much smaller than it looks.",
          senior: "Compare after-inflation: FD 7% vs inflation 6% ≈ +1% real. A long-horizon goal (retirement, 20+ years) can't rely only on that; the next lessons on investing and retirement cover the options — with their risks."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "An FD pays 7% a year and prices rise 6% a year. Roughly how fast is your buying power growing?",
      options: ["About 13% a year", "About 7% a year", "About 1% a year", "It is shrinking"],
      correctIndex: 2,
      explanation: "Real return ≈ interest rate − inflation = 7% − 6% ≈ 1%. Money can grow in rupees while barely growing in what it can actually buy."
    },
    briefs: [
      { emoji: '🏦', fact: 'In India, deposit insurance from DICGC covers each depositor up to a fixed limit per bank — and the limit has been raised before, so always check the current figure.' },
      { emoji: '🔒', fact: 'Breaking a fixed deposit early usually means a penalty on the interest — which is why FDs are for money you will not need soon.' },
      { emoji: '📉', fact: 'Interest earned on a savings account or FD is usually taxable income, so the rate you keep is lower than the rate the bank advertises.' }
    ]
  },

  // ───────────────────────── CREDIT ─────────────────────────
  'l-loans': {
    id: 'l-loans',
    topic: 'credit',
    relatedGame: 'moneyMaze',
    title: 'Loans & EMIs: The Real Cost',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'ln1',
        title: 'What an EMI Really Is',
        body: {
          junior: "An EMI is a fixed amount you pay every month to pay back a loan. Each payment covers a bit of the money you borrowed AND some extra the lender charges (interest). The longer you take, the more extra you pay.",
          teen: "EMI stands for Equated Monthly Instalment — one fixed monthly payment that covers part of the principal (what you borrowed) and interest (the lender's charge). Early EMIs are mostly interest; later ones are mostly principal. A longer loan makes each EMI smaller but the total interest much larger.",
          senior: "An EMI blends principal and interest into a level payment: EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), with r the monthly rate and n the number of months. Because interest is charged on the outstanding balance, early payments are interest-heavy. Tenure is the main lever: a small EMI feels affordable but multiplies total interest."
        },
        example: {
          junior: "Borrow ₹100 from a friend and agree to give back ₹120 in 4 weeks. The extra ₹20 is the interest — the price of using their money.",
          teen: "A ₹5,00,000 loan at 8% a year: over 3 years the EMI is about ₹15,668 and you pay about ₹64,000 in interest. Stretch it to 7 years and the EMI drops to about ₹7,793, but interest jumps to about ₹1,54,600.",
          senior: "₹5,00,000 @ 8%: 3 yrs → EMI ₹15,668, interest ₹64,055 · 5 yrs → EMI ₹10,138, interest ₹1,08,292 · 7 yrs → EMI ₹7,793, interest ₹1,54,621. Cutting the EMI by half costs about ₹90,000 extra in interest."
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Interest paid over 3 years', value: 64, color: '#10b981' },
            { label: 'Interest paid over 5 years', value: 108, color: '#f59e0b' },
            { label: 'Interest paid over 7 years', value: 155, color: '#ef4444' }
          ],
          prefix: '₹',
          unit: 'k'
        },
        xpReward: 25
      },
      {
        id: 'ln2',
        title: 'Flat Rate vs Reducing Balance',
        body: {
          junior: "Some lenders say '12% interest' but charge it on the WHOLE loan for the whole time, even after you've already paid some back. That's a lot more expensive than it sounds — always ask how the interest is worked out.",
          teen: "With a flat rate, interest is calculated on the original loan amount for the entire tenure, even as you repay it. With a reducing-balance rate, interest is charged only on what you still owe. A '12% flat' loan can cost far more than a '12% reducing' loan.",
          senior: "Flat 12% on ₹1,00,000 for 2 years = ₹24,000 interest → EMI ₹5,167. Solving for the reducing-balance rate that gives the same EMI yields about 21.6% a year. Always compare loans by APR / effective rate or by total repayment, never by the headline flat number."
        },
        example: {
          junior: "Two shops both say '12% off'. One means 12% off the full price, the other means 12% off only after you pay extra fees. You must read what the number is applied to!",
          teen: "₹1,00,000 for 2 years. 12% flat: you repay ₹1,24,000 in total. 12% reducing balance: you repay about ₹1,12,976. Same headline number, about ₹11,000 difference.",
          senior: "A ₹5,167 EMI on ₹1,00,000 for 24 months 'feels' like 12% but behaves like ~21.6% a year. When a lender quotes a flat rate (common in two-wheeler, consumer-durable and some personal loans), convert it before comparing offers."
        },
        visual: 'comparison',
        visualData: {
          left: { label: '12% flat – total repaid', value: 124000, color: '#ef4444' },
          right: { label: '12% reducing – total repaid', value: 112976, color: '#10b981' },
          prefix: '₹'
        },
        xpReward: 25
      },
      {
        id: 'ln3',
        title: 'How Much Loan Is Too Much?',
        body: {
          junior: "Before borrowing, ask: can I pay this back easily, even if something goes wrong? Borrowing for something you NEED and can afford is very different from borrowing for something you just WANT right now.",
          teen: "A common guideline: total EMIs across all loans should stay below about 40% of your monthly income — lower is safer. Also ask: is this loan for an asset that holds value, or for something that loses value fast? And always check processing fees and prepayment charges.",
          senior: "Lenders often use a fixed-obligation-to-income ratio (FOIR), commonly around 40–50%, but your personal ceiling should be lower to leave room for savings and emergencies. Check: effective rate, processing fee, foreclosure/part-payment charges, and what happens to your credit score if you miss a payment. Prepaying principal early saves the most interest."
        },
        example: {
          junior: "If you earn ₹100 a week of pocket money, promising ₹60 of it every week to pay back a friend leaves you almost nothing for anything else.",
          teen: "Monthly income ₹50,000. A 40% EMI ceiling = ₹20,000. If you already pay ₹8,000 for a phone EMI, a new loan's EMI must fit in the remaining ₹12,000 — and a lower figure is wiser.",
          senior: "Income ₹80,000; existing EMIs ₹14,000 (17.5%). A new car loan EMI of ₹18,000 takes you to 40%. Even though it is 'within limit', one job gap would strain you — most advisers would suggest a cheaper car or a shorter, larger down payment."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "A lender offers a loan at '12% flat'. What should you do before accepting?",
      options: [
        "Accept — 12% is a low rate",
        "Convert it to the effective (reducing-balance) rate or compare total repayment",
        "Choose the longest tenure for the lowest EMI",
        "Ask only about the processing fee"
      ],
      correctIndex: 1,
      explanation: "A flat rate charges interest on the original amount for the full term, so the true cost can be nearly double the headline number. Compare the effective rate or the total repaid."
    },
    briefs: [
      { emoji: '🧮', fact: 'In the first years of a long loan, most of each EMI goes to interest, not to reducing what you owe — which is why paying a little extra principal early saves so much.' },
      { emoji: '📱', fact: '"No-cost EMI" offers usually still cost something — the interest is often built into the price or charged as a fee. Compare the cash price with the EMI total.' },
      { emoji: '⚠️', fact: 'A missed EMI is reported to credit bureaus and can lower your credit score for years — so it costs more than just the late fee.' }
    ]
  },

  'l-credit-cards': {
    id: 'l-credit-cards',
    topic: 'credit',
    relatedGame: 'creditScoreBuilder',
    title: 'Credit Cards: Tool or Trap?',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'cc1',
        title: "It's a Loan, Not Free Money",
        body: {
          junior: "A credit card lets you buy now and pay the bank later. It is NOT your money — it is a loan from the bank. If you pay it all back on time you pay nothing extra; if you don't, the extra cost is very high.",
          teen: "A credit card is a short-term loan. Every purchase goes on a statement; if you pay the FULL amount by the due date, you pay no interest (during the interest-free period). Pay less, and interest is charged — often 3% or more per MONTH, which compounds to 40%+ a year.",
          senior: "Cards give an interest-free window (often up to ~45–50 days) only when the full statement balance is cleared by the due date. Pay just the 'minimum due' and interest applies on the entire balance — frequently ~3–3.5% a month (36–42% a year), and new purchases lose the interest-free period. It is among the most expensive consumer credit available."
        },
        example: {
          junior: "Borrowing ₹100 from a shop and returning it the next day costs nothing. Keeping it for a year while the shop adds a big fee every month is the trap.",
          teen: "You spend ₹10,000 and pay only the minimum. At 3.5% a month, if you never pay it down that ₹10,000 becomes about ₹15,111 after 12 months — a 51% increase.",
          senior: "₹10,000 carried at 3.5%/month for a year → ₹15,111 (effective ≈ 51% a year). Compare with a personal loan at 14–18%. Revolving card balances should be cleared or moved to cheaper debt first."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Pay in full', value: 10000, color: '#10b981' },
          right: { label: 'Carry for 12 months', value: 15111, color: '#ef4444' },
          prefix: '₹'
        },
        xpReward: 25
      },
      {
        id: 'cc2',
        title: 'The Minimum Due Trap',
        body: {
          junior: "The 'minimum due' is a small amount the bank says you must pay to avoid a late fee. It is a trap if it's all you pay — because the big leftover keeps growing.",
          teen: "'Minimum due' keeps your account in good standing but leaves almost all of the debt (and the interest on it) in place. Paying only the minimum can keep you in debt for years. Also, a late or missed payment is reported and can drop your credit score.",
          senior: "Minimum due is typically ~5% of the outstanding plus fees/GST/interest — enough to prevent a 'default' flag, not enough to retire the debt. Interest accrues on the remaining balance from the transaction date. Habits that protect you: autopay for the full statement amount, a calendar reminder before the due date, and treating the card limit as irrelevant to your real budget."
        },
        example: {
          junior: "If you owe a friend ₹100 and only ever hand back ₹5, you're still stuck owing them for a very long time.",
          teen: "A ₹30,000 bill, pay only 5% (₹1,500) and carry the rest: interest at 3.5% on ₹28,500 is about ₹1,000 that month — so most of your payment would just cover interest, with the debt barely moving.",
          senior: "Set autopay to 'statement balance' (not 'minimum') — you get the convenience and the interest-free period with no risk of forgetting. Keep utilisation under ~30% of the limit to help your score."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'cc3',
        title: 'Rewards, Limits & Smart Use',
        body: {
          junior: "Cards sometimes give 'reward points' or cashback. Those rewards are small compared to the cost of carrying a balance. A reward never beats good habits.",
          teen: "Rewards are only worth it if you pay in full every month. A card that nudges you to spend more than you planned costs more than it earns. Smart use: only buy what you'd have bought with cash, pay in full, and keep balances low relative to your limit.",
          senior: "Effective reward value is typically 1–5% of spend; carrying even one month's interest erases a year of rewards. A higher limit is not extra income — but a low utilisation ratio supports your credit score. Review annual fees against actual benefits, and never use a card for cash withdrawals, which usually attract immediate charges with no interest-free period."
        },
        example: {
          junior: "A sticker for buying something is nice, but it isn't worth getting into debt for.",
          teen: "A card gives 2% cashback. On ₹10,000 of spend that's ₹200 — but one month of interest on a ₹10,000 balance at 3.5% is ₹350. Pay in full and you keep the ₹200; carry it and you lose.",
          senior: "Annual spend ₹3,00,000 at 1.5% net reward = ₹4,500 earned, minus a ₹1,000 annual fee = ₹3,500 net — worthwhile only if you never pay interest. One revolving month at 3.5% on ₹1,00,000 costs ₹3,500."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "You pay only the 'minimum due' on your credit card. What usually happens?",
      options: [
        "The debt is cleared faster",
        "Interest is charged on the remaining balance and the debt can drag on",
        "You earn extra rewards",
        "Your credit limit is cut to zero"
      ],
      correctIndex: 1,
      explanation: "The minimum due only keeps the account in good standing. The remaining balance keeps attracting very high interest, so the debt can linger for years."
    },
    briefs: [
      { emoji: '💳', fact: 'Credit card interest in India is commonly around 3% or more per month — over 40% a year when it compounds — which is why paying in full matters more than any reward.' },
      { emoji: '📊', fact: 'Using under about 30% of your card limit helps your credit score. Maxing a card out can hurt it even if you pay on time.' },
      { emoji: '🏧', fact: 'Withdrawing cash on a credit card usually starts interest immediately, with no interest-free period, plus a fee.' }
    ]
  },

  // ───────────────────────── SPENDING ─────────────────────────
  'l-scams': {
    id: 'l-scams',
    topic: 'spending',
    relatedGame: 'finIQ',
    title: 'Spotting Money Scams & Fraud',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'sc1',
        title: 'Never Share OTPs, PINs or Passwords',
        body: {
          junior: "Some people pretend to be from a bank or a game and ask for secret codes. Real banks NEVER ask for your PIN, password or the code sent to your phone. If anyone asks, say no and tell a trusted grown-up.",
          teen: "OTPs, PINs, CVVs and passwords are keys to your money. No genuine bank, app or government office will ask for them by call, SMS or chat. Scammers create pressure ('your account will be blocked in 10 minutes!') so you act before thinking.",
          senior: "Social-engineering fraud works by urgency, authority and fear: fake KYC updates, 'your electricity will be cut tonight', fake customer-care numbers found through search results, and remote-access apps (screen-sharing) that let a caller see your OTPs. Rule: never share OTP/PIN/CVV, never install an app at a caller's request, and hang up and call the number printed on your card or the official website."
        },
        example: {
          junior: "A message says 'You won a free game prize! Send the code we just sent you.' That code opens your account for them. Don't send it.",
          teen: "A call says 'This is your bank. Tell me the OTP to stop a fraud.' The OTP is exactly what AUTHORISES a payment — you'd be approving the fraud yourself.",
          senior: "You get a 'refund' link for an order you didn't place. Entering your card details or approving a UPI request on that page pays THEM. Receiving money never requires you to enter a PIN."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'sc2',
        title: 'UPI Safety: PIN Is Only for Sending',
        body: {
          junior: "When you use a payment app, your secret PIN is only used to SEND money out. If someone says 'enter your PIN to receive money', it's a trick.",
          teen: "On UPI, you enter your PIN only to authorise a payment going OUT of your account. You never need a PIN to receive money. Fake 'collect requests' and QR codes sent by strangers try to trick you into approving a payment. Always read who the request is from and the amount before you enter the PIN.",
          senior: "Common UPI frauds: collect-request scams ('approve to receive ₹X'), fake payment-success screenshots from buyers on resale platforms, QR codes pasted over legitimate ones, and wrong-number refund requests. Check the name shown before confirming, don't scan unknown QR codes to 'receive', verify credits in your actual bank/UPI app (not screenshots), and set sensible per-transaction limits."
        },
        example: {
          junior: "A stranger says 'I sent you money by mistake, send it back'. Ask a grown-up and check with the bank; don't just send.",
          teen: "You sell an old phone for ₹8,000. The buyer sends a screenshot of 'payment done'. Check your own account for the credit before handing the phone over — screenshots can be faked.",
          senior: "A 'collect request' of ₹5,000 arrives with a note 'prize payout – approve to receive'. Approving it DEBITS you ₹5,000. Decline and report it in the app."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'sc3',
        title: "Too-Good-To-Be-True Returns",
        body: {
          junior: "If someone promises you will get lots of extra money for doing almost nothing, be suspicious. Real money grows slowly and has some risk. 'Guaranteed' big profits are a warning sign.",
          teen: "Investment frauds promise high, 'guaranteed' returns with little or no risk, push you to recruit friends, or ask for money through personal accounts. Red flags: guaranteed returns, urgency, pressure to bring others in, unregistered advisers, and screenshots of fake profits. Genuine investments carry risk and come from registered, regulated entities.",
          senior: "Ponzi/pyramid structures pay early investors out of new investors' money until recruitment stalls. Pump-and-dump groups on messaging apps push low-priced stocks or tokens, then sell into the buying they created. Before investing: confirm the adviser/broker/product is registered with the regulator (e.g., SEBI for securities), never invest on a stranger's tip, and treat 'risk-free' plus 'high return' as mutually exclusive."
        },
        example: {
          junior: "'Give me ₹100 and I'll give you ₹1000 next week, no risk!' Nobody gives that, unless they're tricking you.",
          teen: "A stranger on a messaging app shares screenshots of profits and offers a 'sure 5% a day'. 5% a day, compounding, would turn ₹10,000 into tens of thousands of crores in a year — that is impossible, so it is a scam.",
          senior: "A 'trading group' shows daily 'wins' and asks you to deposit into a personal UPI ID, then blocks withdrawals with 'tax' and 'release' fees. If it is not a registered entity paying from regulated platforms, assume there is no recourse."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "A caller says they're from your bank and asks for the OTP 'to stop a fraud'. What is the right response?",
      options: [
        "Share it quickly so your account is safe",
        "Share only the last 3 digits",
        "Hang up and never share it; call the number on your card or official site",
        "Ask them to message it to you first"
      ],
      correctIndex: 2,
      explanation: "An OTP authorises a payment. Genuine banks never ask for it. Hang up and call the official number yourself, and if you lose money report it immediately on 1930 or cybercrime.gov.in."
    },
    briefs: [
      { emoji: '📞', fact: 'If you lose money to an online fraud in India, report it quickly on the national cybercrime helpline 1930 or at cybercrime.gov.in — faster reporting improves the chance of freezing the funds.' },
      { emoji: '🔑', fact: 'You never need to enter a UPI PIN to receive money. A request that asks you to enter your PIN "to receive" is a scam.' },
      { emoji: '🚩', fact: '"Guaranteed high returns" is the oldest red flag in investing. Real investments carry risk, and regulators publish lists of registered advisers you can check.' }
    ]
  },

  'l-marketing': {
    id: 'l-marketing',
    topic: 'spending',
    relatedGame: 'budgetBlitz',
    title: 'How Marketing Tricks Your Brain',
    estimatedMinutes: 4,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'mk1',
        title: 'Anchors, Scarcity & FOMO',
        body: {
          junior: "Shops use tricks to make you want things right now: 'Only 2 left!', 'Sale ends tonight!', or showing a high price crossed out. These tricks make your brain hurry. A good habit: wait one day before buying.",
          teen: "Marketers use psychology: ANCHORING (a crossed-out high price makes the sale price look amazing), SCARCITY ('only 3 left!'), and FOMO — fear of missing out. These work because they create urgency before you've asked whether you actually need the item. The simplest defence is a waiting rule: sleep on any non-essential purchase.",
          senior: "Common levers: anchoring (inflated 'original' prices), scarcity/urgency timers, social proof ('1,200 bought today'), and loss framing ('don't miss out'). Many are engineered, not real. Countermeasure: a cooling-off rule (24 hours for ₹1,000+ wants; 7 days for large ones), comparing the unit price, and asking 'would I buy this at this price if there were no sale?'"
        },
        example: {
          junior: "A toy shows '₹500, now ₹350!' but it was never really ₹500. The big crossed-out number is just to make ₹350 look cheap.",
          teen: "A pair of sneakers: 'Was ₹6,000 – now ₹3,999! Ends in 2 hours!' If you'd never pay ₹3,999 for sneakers on a normal day, a 'discount' isn't saving you money — it's making you spend ₹3,999.",
          senior: "Discount math: a '40% off' ₹5,000 item is ₹3,000, but if the item's usual price was ₹3,500, the real discount is ~14%. Saving ₹500 is only a gain if you were going to buy it anyway."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'mk2',
        title: 'Small Payments, Big Leaks',
        body: {
          junior: "Free trials and tiny monthly payments can add up. A ₹100 subscription you forget about costs ₹1,200 in a year!",
          teen: "Subscriptions and 'free trials' are designed to be easy to start and easy to forget. 'Dark patterns' — hidden cancel buttons, pre-ticked boxes, confusing wording — keep you paying. Audit your subscriptions every few months and cancel what you don't use.",
          senior: "Recurring small charges (OTT, apps, cloud storage, memberships) compound into a significant fixed cost, and free trials auto-convert to paid. Track them by listing every recurring debit on your bank/UPI/card statement. An annual plan can save money only if you'd use it for the full year. Use virtual/limited cards or calendar reminders for trials."
        },
        example: {
          junior: "Five apps at ₹100 a month each = ₹500 a month = ₹6,000 a year. That's a bicycle!",
          teen: "Four subscriptions at ₹199, ₹149, ₹299 and ₹99 a month = ₹746 a month = ₹8,952 a year. Cancel two you rarely use and you free up well over ₹4,000 a year.",
          senior: "Annual cost of recurring charges: (₹199 + ₹149 + ₹299 + ₹99) × 12 = ₹8,952. If 40% of that is unused, you're wasting ~₹3,580 a year — roughly a month of savings."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'mk3',
        title: 'Buy Now, Pay Later: Read the Fine Print',
        body: {
          junior: "'Buy now, pay later' means taking something home today and paying afterwards. It feels free, but if you forget to pay, there can be big extra charges.",
          teen: "Buy Now, Pay Later (BNPL) splits or defers a payment. It can be interest-free if you pay on time, but late fees and penalties can be steep, and it makes spending feel painless — so people spend more. Treat it like any other loan: only use it for something you were already going to buy and can pay for.",
          senior: "BNPL/pay-later products shift pain from the checkout to the future. Risks: late fees and penal interest, lower perceived cost leading to higher spending, multiple small obligations that are hard to track, and credit-bureau reporting in many cases. Rule of thumb: if you couldn't pay the full amount today without hardship, you probably shouldn't buy it on pay-later."
        },
        example: {
          junior: "Taking a toy today and paying next month sounds great, until next month you also have to pay for three other things.",
          teen: "A ₹12,000 purchase split into 3 payments of ₹4,000 feels light. But if you've also done two other 3-part splits, you now owe ₹12,000 a month — most of an ₹18,000 pocket budget.",
          senior: "Test before choosing pay-later: (1) would I buy this if I had to pay in full today? (2) is the total cost (fees included) equal to the cash price? (3) can I list all my other pending instalments? If any answer is 'no', skip it."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "A store shows 'Was ₹6,000 – now ₹3,999, ends in 2 hours!' What is the smartest first question?",
      options: [
        "How fast can I buy before it ends?",
        "Would I buy this at ₹3,999 if there were no sale and no timer?",
        "Is the crossed-out price really high enough?",
        "Can I put it on pay-later?"
      ],
      correctIndex: 1,
      explanation: "A discount only saves money if you intended to buy the item anyway. Urgency timers and crossed-out prices are designed to make you skip that question."
    },
    briefs: [
      { emoji: '⏳', fact: 'Some "limited-time" countdown timers on shopping sites are fake and simply reset when you reload the page — they exist to create urgency, not to measure it.' },
      { emoji: '🔁', fact: 'Free trials that need a card often auto-renew into a paid plan. Setting a reminder for the day before the trial ends is one of the easiest ways to save money.' },
      { emoji: '🛑', fact: 'A 24-hour waiting rule for non-essential purchases is a well-known way to cut impulse buying — the urge to buy often fades by the next day.' }
    ]
  },

  // ───────────────────────── TAXES ─────────────────────────
  'l-income-tax': {
    id: 'l-income-tax',
    topic: 'taxes',
    relatedGame: 'finIQ',
    title: 'Slabs, TDS & Filing Your Return',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'it1',
        title: 'Marginal vs Effective Tax Rate',
        body: {
          junior: "Taxes are money everyone pays to the government to build roads, schools and hospitals. The more a person earns, the more they usually pay.",
          teen: "Income tax works in slabs: each slice of your income is taxed at its own rate. Crossing into a higher slab does NOT tax all your income at the higher rate — only the part inside that slab. Your effective rate (total tax ÷ total income) is therefore lower than your top (marginal) rate.",
          senior: "Marginal rate = the rate on your next rupee of income; effective rate = total tax ÷ total income. Because slabs are progressive, a raise can never push your take-home below where it was before. Slab limits and rates, rebates and the available regime choice are set in the Union Budget and change — always check the current figures on the income tax department's website before relying on any number."
        },
        example: {
          junior: "If you earn ₹100 and 10 of it goes to tax, you still keep ₹90. Tax is a part of what you earn, not all of it.",
          teen: "Illustrative slabs: 0–3L nil, 3–7L 5%, 7–10L 10%. On ₹9,00,000: 5% × ₹4,00,000 = ₹20,000, plus 10% × ₹2,00,000 = ₹20,000 → ₹40,000 tax = 4.4% effective, even though the top slab is 10%.",
          senior: "Same illustrative slabs: income ₹9,00,000 → tax ₹40,000 (effective 4.4%, marginal 10%). A ₹50,000 raise is taxed at 10% on the extra slice (₹5,000), so you keep ₹45,000 of it. (Simplified: ignores rebates, cess and deductions.)"
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Marginal rate (top slab)', value: 10, color: '#f59e0b' },
          right: { label: 'Effective rate overall', value: 4.4, color: '#10b981' },
          unit: '%'
        },
        xpReward: 25
      },
      {
        id: 'it2',
        title: 'TDS, Form 16 & Form 26AS',
        body: {
          junior: "Sometimes an employer takes the tax from a salary before paying it, and sends it to the government for you. That way you don't have to pay it all in one go.",
          teen: "TDS (Tax Deducted at Source) means tax is taken before you get the money — employers deduct it from salary, banks from some interest. Form 16 is the employer's certificate of salary and tax deducted. Your tax credit statement (Form 26AS / AIS) lists all TDS reported against your PAN, so you can check it matches.",
          senior: "TDS is an advance payment of your final tax liability. At filing, total tax is computed and TDS (plus any advance tax) is credited: if TDS exceeded your liability you claim a refund; if it fell short you pay the balance. Reconcile Form 16 with Form 26AS/AIS before filing — mismatches in income or TDS cause notices."
        },
        example: {
          junior: "Like a school canteen deducting your lunch fee from your prepaid card — you don't pay again at the counter.",
          teen: "Your employer deducts ₹3,000 TDS during the year. At filing, your total tax comes to ₹2,200. You've overpaid by ₹800 and claim it back as a refund.",
          senior: "Salary TDS ₹60,000 + bank-interest TDS ₹2,000 = ₹62,000 credited. Final computed liability ₹57,500 → refund of ₹4,500. If liability were ₹70,000, you'd pay ₹8,000 as self-assessment tax before filing."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'it3',
        title: 'Why Filing Matters (Even With a Refund)',
        body: {
          junior: "Grown-ups fill a form every year to tell the government what they earned and paid. It's like submitting a report card for money.",
          teen: "An Income Tax Return (ITR) is the yearly declaration of your income and taxes paid. You claim refunds, build a record that helps with loans and visas, and avoid penalties by filing on time (the usual due date for salaried individuals is 31 July, though it can be extended). Even if TDS was deducted, you may still need to file to get any excess back.",
          senior: "Filing is mandatory above the basic exemption limit or for specified transactions, and prudent otherwise: it creates an income record for loan, visa and credit-card applications, carries forward certain losses, and enables refunds. Late filing can attract fees and interest, and revised/belated returns have time limits. Income of a minor child is generally clubbed with a parent's for tax, so teens with savings interest should tell their parents rather than assume it is 'tax-free'."
        },
        example: {
          junior: "You hand in a project on time to get full marks. Filing taxes on time is the grown-up version.",
          teen: "A part-timer's employer deducted ₹4,000 TDS during the year, but their total income is below the taxable limit, so their real tax is ₹0. They file an ITR to claim the full ₹4,000 refund — and now have an income record for a future loan.",
          senior: "A freelancer earns ₹6,50,000 with no TDS. They must estimate liability and pay advance tax in instalments, then file the return — skipping advance tax leads to interest charges even if the final bill is paid on time."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "Your income crosses into a higher tax slab. What happens?",
      options: [
        "All your income is now taxed at the higher rate",
        "Only the income inside the higher slab is taxed at the higher rate",
        "You pay no tax on the extra income",
        "The tax is the same as before"
      ],
      correctIndex: 1,
      explanation: "Slabs are progressive: each slice of income is taxed at its own rate. Your effective rate is always lower than your top slab rate."
    },
    briefs: [
      { emoji: '🧾', fact: 'Tax slabs, rebates and rules are updated in the Union Budget most years — a number you learn today may be different next year, so check the official income-tax website for current rates.' },
      { emoji: '💰', fact: 'A tax refund is just your own money coming back: you paid more in advance (through TDS) than you owed.' },
      { emoji: '🪪', fact: 'Your PAN links your income, TDS and investments across banks and employers, which is why the tax department can see them together in your annual information statement.' }
    ]
  },

  'l-gst': {
    id: 'l-gst',
    topic: 'taxes',
    relatedGame: 'finIQ',
    title: "Hidden Taxes: GST in the Price Tag",
    estimatedMinutes: 3,
    ageGroups: ['junior', 'teen', 'senior'],
    cards: [
      {
        id: 'gs1',
        title: "You Pay Tax Without Noticing",
        body: {
          junior: "Even kids pay tax! When you buy a snack or a toy, a small part of the price goes to the government as GST (Goods and Services Tax). It's already included, so you don't see it separately.",
          teen: "GST is an indirect tax: it's built into the price of goods and services, and the seller collects it and passes it to the government. Unlike income tax, it applies to everyone who buys, regardless of income. Different items fall in different GST rate categories, and the rates are revised from time to time.",
          senior: "GST is a destination-based consumption tax charged at each stage of the supply chain, with businesses claiming input tax credit for tax already paid on inputs, so effectively the final consumer bears it. It is regressive in effect — a lower earner spends a larger share of income on taxed goods. Rate slabs and which items sit in them are set by the GST Council and have been restructured before; check the current schedule."
        },
        example: {
          junior: "A toy shows ₹118 at the counter. About ₹18 of that is tax, and ₹100 is the shop's price.",
          teen: "A pair of earphones has a base price of ₹1,000. At 18% GST the tax is ₹180 and the price you pay is ₹1,180.",
          senior: "Reverse calculation: if the bill says ₹1,180 including 18% GST, the pre-tax price is ₹1,180 ÷ 1.18 = ₹1,000 and the GST is ₹180. (It is NOT 18% of ₹1,180, which would be ₹212.40.)"
        },
        visual: 'bar',
        visualData: {
          items: [
            { label: 'Base price', value: 1000, color: '#2e72db' },
            { label: 'GST @18%', value: 180, color: '#ef4444' },
            { label: 'You pay', value: 1180, color: '#10b981' }
          ],
          prefix: '₹'
        },
        xpReward: 20
      },
      {
        id: 'gs2',
        title: 'Read the Bill',
        body: {
          junior: "Look at a shop bill with a grown-up. You'll often see the price and then a line for tax. Spotting it helps you understand where your money goes.",
          teen: "A proper tax invoice shows the item price, GST charged, and the seller's GST number (GSTIN). Asking for a bill matters: it records the sale, supports warranties and returns, and helps the economy by keeping sellers accountable. Be careful with tricks like 'no bill, no GST — pay less in cash' — it usually means no warranty or return rights.",
          senior: "On an invoice, check the taxable value, CGST+SGST (intra-state) or IGST (inter-state), the rate, and the seller's GSTIN. For purchases you will claim input credit on (business use), a valid invoice is required. As a consumer, an invoice is also your proof of purchase for warranty, return and consumer-court claims."
        },
        example: {
          junior: "Bill: Notebook ₹100 + tax ₹5 = ₹105. The tax part is what the shop sends to the government.",
          teen: "A shop offers a ₹30,000 laptop for ₹28,000 'without bill'. You save ₹2,000 now, but without an invoice a faulty laptop may not be covered by warranty.",
          senior: "Invoice: taxable value ₹25,424 + GST 18% (₹4,576) = ₹30,000. The GSTIN lets you verify the seller on the GST portal, which helps spot fake invoices."
        },
        visual: 'none',
        xpReward: 20
      },
      {
        id: 'gs3',
        title: 'Direct vs Indirect Taxes',
        body: {
          junior: "Some taxes come out of what you earn (like a salary). Other taxes are added to what you buy (like GST). Both help pay for things we all use.",
          teen: "Direct taxes (like income tax) are paid directly by the person earning the income. Indirect taxes (like GST) are collected through the price of what you buy. Governments use both: direct taxes scale with income, while indirect taxes are paid on spending.",
          senior: "Direct taxes are levied on the taxpayer's income or wealth and cannot be shifted; indirect taxes are levied on transactions and passed on to the consumer. A balanced system uses both — progressive direct taxes for ability-to-pay and broad indirect taxes for stable revenue. For personal planning, you control your direct tax through legitimate deductions and choices, while indirect tax is controlled mainly by what and how much you buy."
        },
        example: {
          junior: "Pocket money: if a parent keeps ₹10 for a family fund, that's like an income tax. The extra coins you pay at the canteen are like GST.",
          teen: "Earning ₹50,000: income tax comes out of your salary (direct). Spending ₹10,000 on shopping includes GST inside each price (indirect).",
          senior: "Two people with different incomes buy the same ₹10,000 phone and both pay the same GST. Their income tax differs by slab — direct tax follows income, indirect follows the purchase."
        },
        visual: 'none',
        xpReward: 20
      }
    ],
    quizCard: {
      question: "A bill shows ₹1,180 including 18% GST. What is the price before GST?",
      options: ["₹1,000", "₹968", "₹1,062", "₹1,180 − ₹18 = ₹1,162"],
      correctIndex: 0,
      explanation: "Price including GST = base × 1.18, so base = ₹1,180 ÷ 1.18 = ₹1,000 and GST = ₹180. Taking 18% of the bill total gives the wrong answer."
    },
    briefs: [
      { emoji: '🛒', fact: 'Everyone who buys something pays GST inside the price — including children and people who do not earn an income.' },
      { emoji: '📝', fact: 'Always ask for a proper bill: it is your proof for warranty, returns and consumer complaints.' },
      { emoji: '🔄', fact: 'GST rates and which items fall in which category are revised by the GST Council from time to time, so lists you see online can be out of date.' }
    ]
  },

  // ───────────────────────── SAVING / RETIREMENT ─────────────────────────
  'l-retirement': {
    id: 'l-retirement',
    topic: 'saving',
    relatedGame: 'finIQ',
    title: 'Retirement: EPF, PPF & NPS',
    estimatedMinutes: 4,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'rt1',
        title: 'Why Retirement Needs a Plan',
        body: {
          junior: "One day grown-ups stop working but still need money for food and a home. They save little by little for many years so their money can last.",
          teen: "Most people will spend 20–30 years after they stop earning, and a salary stops on the day you retire. Retirement money has to be built during your working years. Because of compounding, the YEARS you invest matter more than the AMOUNT you invest — starting 10 years earlier can double the final pot.",
          senior: "Retirement planning has three levers: how much you save, how long you save, and the return earned. Time is the strongest because of compounding. At an ASSUMED 8% a year (not guaranteed), ₹5,000 a month for 35 years grows to roughly ₹1.15 crore, versus about ₹47.6 lakh for 25 years — the extra 10 years adds nearly ₹67 lakh while costing only ₹6 lakh more in contributions."
        },
        example: {
          junior: "Planting a tree: the earlier you plant it, the bigger it is when you need the shade.",
          teen: "Start at 25 with ₹5,000 a month, retire at 60 (35 years): about ₹1.15 crore at an assumed 8%. Start at 35 (25 years): about ₹47.6 lakh. Waiting 10 years costs you more than half.",
          senior: "Contributions: 35 yrs × ₹60,000 = ₹21 lakh → ₹1.15 crore. 25 yrs × ₹60,000 = ₹15 lakh → ₹47.6 lakh. (Assumed 8% p.a.; real returns vary, and inflation reduces what a crore buys in 35 years.)"
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Start at 35 (25 yrs)', value: 47.6, color: '#f59e0b' },
          right: { label: 'Start at 25 (35 yrs)', value: 114.7, color: '#10b981' },
          prefix: '₹',
          unit: ' lakh'
        },
        xpReward: 25
      },
      {
        id: 'rt2',
        title: 'EPF, PPF & NPS in Plain Words',
        body: {
          junior: "There are special savings plans in India just for the long future. Some come with your job, and some you open yourself. They are designed so you don't touch the money until much later.",
          teen: "EPF (Employees' Provident Fund): for salaried employees, both you and your employer contribute a percentage of basic pay each month. PPF (Public Provident Fund): a government-backed savings scheme anyone can open, with a long lock-in (15 years) and a rate set by the government. NPS (National Pension System): a market-linked pension account where your money is invested across equity and debt and mostly locked until retirement age.",
          senior: "EPF: mandatory for eligible employees, typically 12% of basic from each side (part of the employer share goes to the pension scheme), interest declared annually. PPF: sovereign-backed, 15-year lock-in with limited partial withdrawals, annual contribution cap, rate reset by the government periodically. NPS: low-cost, market-linked, choice of equity/debt allocation, partial withdrawals allowed under conditions, and a portion must be used to buy an annuity at retirement. Contribution limits, tax treatment and rules change — verify the current terms before investing."
        },
        example: {
          junior: "A locked savings box that only opens when you're much older keeps you from spending it early.",
          teen: "First job, ₹30,000 basic: your 12% = ₹3,600 goes to EPF every month, and your employer adds a matching share. You never see it, so you can't spend it.",
          senior: "Mix by purpose: EPF for the automatic, employer-linked core; PPF for guaranteed-style, long-horizon debt allocation; NPS for market-linked growth with a built-in retirement lock. Each has different liquidity, risk and tax treatment — they complement rather than replace each other."
        },
        visual: 'none',
        xpReward: 25
      },
      {
        id: 'rt3',
        title: 'The Risk You Can’t See: Inflation',
        body: {
          junior: "A hundred rupees today buys more than a hundred rupees will buy in many years, because prices keep creeping up. So retirement savings must grow, not just sit.",
          teen: "Over 30 years, even 6% inflation makes prices about 5.7 times higher. ₹1 crore sounds huge, but in 30 years it may buy what ₹17–18 lakh buys today. That is why retirement plans need some growth investments, not only fixed-rate ones.",
          senior: "Inflation compounds against you: at 6% for 30 years, prices rise by a factor of about 5.74, so a corpus must be sized in future rupees, not today's. A diversified plan usually mixes safe, fixed-return instruments (for stability) with growth assets (for beating inflation), shifting toward stability as retirement nears. No product here is risk-free in real terms."
        },
        example: {
          junior: "A chocolate that costs ₹10 now might cost much more when you're a grown-up. Your savings must grow to keep up.",
          teen: "A monthly expense of ₹30,000 today becomes about ₹1.72 lakh a month in 30 years at 6% inflation. Retirement targets must account for this.",
          senior: "Today's ₹50,000 monthly need ≈ ₹2.87 lakh a month after 30 years at 6% inflation; a 4% withdrawal rate would need a corpus of roughly ₹8.6 crore. This is why early, consistent saving matters — and why assumptions should be reviewed regularly."
        },
        visual: 'none',
        xpReward: 25
      }
    ],
    quizCard: {
      question: "Why does starting to save for retirement 10 years earlier often matter more than saving more later?",
      options: [
        "Banks pay a bonus for early savers",
        "Compounding has more years to work on the money",
        "Taxes disappear after 10 years",
        "Inflation stops during the saving period"
      ],
      correctIndex: 1,
      explanation: "Returns earn their own returns over time. The extra years of compounding add far more to the final pot than the extra contributions you make."
    },
    briefs: [
      { emoji: '⏰', fact: 'Because of compounding, starting a retirement contribution at 25 instead of 35 can more than double the final amount, even with the same monthly deposit.' },
      { emoji: '🏛️', fact: 'EPF, PPF and NPS each have different lock-ins, limits and tax rules, and those rules are revised from time to time — check the official source before you invest.' },
      { emoji: '🎯', fact: 'Retirement estimates rely on assumed returns and inflation. They are planning tools, not promises.' }
    ]
  },
  // ───────────────────────── INVESTING: WHAT MOVES A STOCK ─────────────────────────
  // Added 2026-10-15 at a tester's request ("why does a buyback make a stock fall?
  // why does inflation affect the market? what moves a market?"). Placed right after
  // 'l-investing' so stock/share vocabulary is already taught.
  // Maths: 1,000 cr profit / 100 cr shares = EPS 10. Buy back 5% (5 cr shares at 150
  // = 750 cr) → 95 cr shares → EPS 10.53; at an unchanged P/E of 15 that is ~157.9.
  // Discounting: 100 / 1.05 = 95.24, 100 / 1.08 = 92.59.
  'l-stock-movers': {
    id: 'l-stock-movers',
    topic: 'investing',
    relatedGame: 'stockMarketSim',
    title: 'What Makes a Stock Move?',
    estimatedMinutes: 6,
    ageGroups: ['teen', 'senior'],
    cards: [
      {
        id: 'sm1',
        title: 'A Price Is a Tug-of-War',
        body: {
          junior: "A stock's price is just what people agree to pay right now. If lots of people want to buy it, the price goes up. If lots want to sell, it goes down.",
          teen: "A stock price is simply the last price a buyer and a seller agreed on. Every trade needs both. When more people want to buy than sell, buyers have to offer more to get shares, so the price rises. When more want to sell, sellers have to accept less, so it falls. News matters only because it changes how many people want to buy or sell.",
          senior: "A quoted price is the last price at which a buyer and a seller were matched. Price discovery is the tug-of-war between demand and supply at each moment: excess buying pushes the price up until enough sellers are tempted, excess selling pushes it down until enough buyers step in. Every driver in this lesson — profits, rates, inflation, news — works through one channel: it shifts the balance of buyers and sellers."
        },
        example: {
          junior: "Like trading cards at school: a rare card everyone wants costs more stickers than a card nobody cares about.",
          teen: "A company announces a new factory. More investors think it will earn more in future, so more want to buy. Sellers now ask for a higher price before letting go of their shares — and the price climbs.",
          senior: "On results day a stock sees 5 lakh shares of buy orders against 2 lakh of sell orders at the current price. The unmatched buyers bid higher, and the price steps up until selling interest rises to meet them."
        },
        visual: 'tug',
        visualData: {
          leftLabel: 'Sellers',
          rightLabel: 'Buyers',
          events: [
            { label: 'Company reports record profit', shift: 22 },
            { label: 'New factory announced', shift: 14 },
            { label: 'Big investor sells a large stake', shift: -16 },
            { label: 'A key product is banned', shift: -28 },
            { label: 'Central bank hikes interest rates', shift: -12 },
            { label: 'Strong sales numbers released', shift: 18 }
          ]
        },
        xpReward: 25
      },
      {
        id: 'sm2',
        title: "It's Not the News — It's the Surprise",
        body: {
          junior: "Sometimes a company has great news and its stock still falls! That happens when people hoped for even MORE than they got.",
          teen: "Markets move on the gap between what people EXPECTED and what actually happened. If investors already expect a big profit, the price already includes it — this is called being 'priced in'. A good result that is smaller than hoped can make a stock fall, and a bad result that is better than feared can make it rise.",
          senior: "Prices reflect expectations, so only new information moves them. Analysts publish consensus estimates and traders form unofficial 'whisper' numbers; the reaction depends on the surprise versus those, plus any change in guidance for the future. A beat that is smaller than the whisper number, or a strong quarter paired with cautious guidance, can trigger a sell-off even though the headline looks good."
        },
        example: {
          junior: "Imagine you hoped for 100 marks and got 90. You feel sad even though 90 is great. Stocks react to hopes, too.",
          teen: "Analysts expect ₹100 crore profit; a company reports ₹110 crore — a beat. But traders had quietly hoped for ₹125 crore, so many sell and the stock drops anyway.",
          senior: "Consensus EPS ₹10, reported ₹10.50 (+5% beat), but management cuts next-year growth guidance from 18% to 12%. The market reprices the future, not the past quarter, and the stock falls despite the beat."
        },
        visual: 'chain',
        visualData: {
          steps: [
            { title: 'Analysts expect a profit of ₹100 crore' },
            { title: 'The company reports ₹110 crore — a beat!' },
            { title: 'But traders had quietly hoped for ₹125 crore', note: 'That hope was already built into the price.' },
            { title: 'Disappointed buyers sell, and the price falls', note: 'The news was good. It was just less good than the price assumed.' }
          ]
        },
        xpReward: 25
      },
      {
        id: 'sm3',
        title: 'What Is a Buyback?',
        body: {
          junior: "A buyback is when a company uses its own money to buy back some of its own shares from people. The company then has fewer shares in the world.",
          teen: "A buyback (share repurchase) is when a company uses its spare cash to buy its own shares from investors, then cancels them. With fewer shares left, each remaining share owns a bigger slice of the company, and profit per share (EPS) goes up even if total profit stays the same. Companies do it to return cash to shareholders and sometimes to signal they think the stock is cheap.",
          senior: "A buyback is a capital-return method: the company repurchases its shares through the open market or a tender offer (often at a premium to market) and extinguishes them. Share count falls, so earnings per share rise mechanically: EPS = profit ÷ shares outstanding. It is an alternative to dividends, and its tax treatment for shareholders differs by country and has changed over time — check the current rules. The cash used is no longer available for growth or to cut debt."
        },
        example: {
          junior: "A pizza cut into 10 slices: you own 1 slice. If 5 slices disappear, the same pizza is cut into fewer slices, so your slice is worth more.",
          teen: "A company earns ₹1,000 crore with 100 crore shares: EPS = ₹10. It spends ₹750 crore to buy back 5 crore shares at ₹150. Now there are 95 crore shares: EPS = ₹10.53. Same profit, higher profit per share.",
          senior: "₹1,000 cr profit, 100 cr shares → EPS ₹10. Repurchase 5% (5 cr shares × ₹150 = ₹750 cr) → 95 cr shares → EPS ≈ ₹10.53 (+5.3%). At an unchanged P/E of 15, that implies a price of about ₹158 versus ₹150 — before accounting for the lost interest income on the ₹750 cr and the loss of financial flexibility."
        },
        visual: 'comparison',
        visualData: {
          left: { label: 'Profit per share BEFORE buyback', value: 10, color: '#94a3b8' },
          right: { label: 'AFTER buying back 5% of shares', value: 10.5, color: '#10b981' },
          prefix: '₹'
        },
        xpReward: 25
      },
      {
        id: 'sm4',
        title: 'Why a Buyback Can Lift — or Drop — a Price',
        body: {
          junior: "Buybacks usually help a stock because there are fewer shares and the company seems confident. But they can also hurt if the company is using its money in a risky way.",
          teen: "Buybacks often lift a price: higher EPS, extra demand from the company itself, and a signal that management thinks the shares are cheap. But the price can fall too — if the company borrows heavily to fund it, if investors read it as 'we have no better ideas to grow', if it was already expected (priced in), or when a tender offer ends and the extra demand disappears. A buyback is information, not a guarantee.",
          senior: "Announcement effects are on average positive, but not mechanical. Bearish readings: debt-funded repurchases raise financial risk; it may signal that management sees few high-return growth projects; buybacks can merely offset dilution from employee stock options (so the share count doesn't really fall); and a tender-offer premium vanishes once the window closes. Judge a buyback by its funding source, the company's growth prospects, whether it was anticipated, and whether it actually reduces the share count."
        },
        example: {
          junior: "A shop that uses its savings to buy more of its own stickers may look confident — or may be out of better ideas. You'd need to look at the whole story.",
          teen: "Company A uses spare cash for a buyback: investors cheer. Company B borrows heavily to do the same: investors worry about its debt, and the price falls. Same word, opposite reactions.",
          senior: "A firm announces a ₹2,000 cr buyback funded by new borrowing while its sales growth is slowing. EPS rises, but net debt/EBITDA also rises and the market reads it as financial engineering — the stock falls despite the headline."
        },
        visual: 'tug',
        visualData: {
          leftLabel: 'Pushes price down',
          rightLabel: 'Pushes price up',
          events: [
            { label: 'Fewer shares, so profit per share rises', shift: 20 },
            { label: 'Signals management thinks the stock is cheap', shift: 15 },
            { label: 'Funded by taking on heavy debt', shift: -22 },
            { label: 'Read as "no better growth ideas"', shift: -16 },
            { label: 'Already expected, so it is priced in', shift: -8 },
            { label: 'Tender offer ends and the extra demand stops', shift: -12 }
          ]
        },
        xpReward: 30
      },
      {
        id: 'sm5',
        title: 'Inflation, Interest Rates & Stocks',
        body: {
          junior: "When prices of everything keep rising, the people who run the country's money try to slow it down by making borrowing more expensive. That usually makes company stocks less exciting.",
          teen: "When inflation runs high, central banks often raise interest rates to cool the economy. Higher rates make loans costlier for companies and shoppers, so profits are expected to slow. They also make safe options like FDs and bonds pay more, so stocks look less attractive. Finally, investors value a company by its FUTURE profits — and higher interest rates make those future profits worth less today.",
          senior: "Inflation hits stocks through several channels: input costs squeeze margins unless a company has pricing power; consumers cut discretionary spending; and central banks raise policy rates. Higher rates lift borrowing costs, raise the yield on risk-free alternatives, and increase the discount rate applied to future cash flows — which reduces present values, with long-duration 'growth' stocks (profits far in the future) typically hit hardest. The effect isn't uniform: companies with pricing power and banks with widening margins can hold up better."
        },
        example: {
          junior: "Saving ₹100 for next year is worth less to you today if you could earn more interest elsewhere. Investors think the same way about a company's future profits.",
          teen: "₹100 promised in one year is worth about ₹95.2 today if safe interest is 5%, but only about ₹92.6 if it is 8%. The same future profit becomes worth less today, so share prices tend to fall when rates rise.",
          senior: "Discounting a ₹100 cash flow due in a year: ÷1.05 = ₹95.24, ÷1.08 = ₹92.59 (−2.8%). For a cash flow due in 10 years the gap is far larger (÷1.05¹⁰ = ₹61.4 versus ÷1.08¹⁰ = ₹46.3, −24.6%), which is why growth stocks swing the most on rate news."
        },
        visual: 'chain',
        visualData: {
          steps: [
            { title: 'Prices rise faster across the economy (inflation)' },
            { title: 'The central bank raises interest rates to cool things down' },
            { title: 'Loans cost more; FDs and bonds now pay more', note: 'Safe options become more tempting than stocks.' },
            { title: 'Companies pay more to borrow, and shoppers spend less', note: 'Profits are expected to grow more slowly.' },
            { title: 'Future profits are worth less today, so stocks tend to fall', note: 'Growth stocks usually feel it most.' }
          ]
        },
        xpReward: 30
      },
      {
        id: 'sm6',
        title: 'What Moves the Whole Market?',
        body: {
          junior: "Sometimes all stocks go up or down together. That can happen because of big news — like how the economy is doing, what's happening in other countries, or whether people feel confident or scared.",
          teen: "Whole markets move on big-picture forces: economic data (growth, jobs, inflation), central bank decisions, oil and currency moves, global markets (a sell-off abroad often spills over), money flowing in or out from big institutions and foreign investors, major elections or policy changes, and plain sentiment — fear and greed. Often several act at once, and markets react to what is EXPECTED to happen, not only what has happened.",
          senior: "Index-level drivers: macro data and policy (growth, inflation, rate path), liquidity and institutional flows (e.g., foreign portfolio investors' buying or selling), global risk appetite and correlated sell-offs, commodity and currency shocks (oil, the rupee), earnings season trends, regulation and elections, and sentiment — measured by gauges like India VIX. Short-term moves are noisy and hard to predict; that is why diversification and a long horizon matter more than guessing the next headline."
        },
        example: {
          junior: "If everyone in school gets scared about a rumour, many kids might sell their stickers at once — and prices drop for all of them.",
          teen: "Global markets fall sharply overnight and oil spikes. Investors fear slower growth, so the Indian market opens lower even though no Indian company has had bad news.",
          senior: "FPIs sell heavily for several sessions as US yields rise and the rupee weakens; the index falls even though domestic earnings are on track. Months later, flows reverse and the index recovers — the trigger was liquidity and global risk appetite, not company fundamentals."
        },
        visual: 'tug',
        visualData: {
          leftLabel: 'Market falls',
          rightLabel: 'Market rises',
          events: [
            { label: 'Strong economic growth data', shift: 18 },
            { label: 'Oil prices spike sharply', shift: -18 },
            { label: 'Foreign investors buy heavily', shift: 24 },
            { label: 'Global markets sell off overnight', shift: -26 },
            { label: 'Central bank cuts interest rates', shift: 20 },
            { label: 'Election result creates uncertainty', shift: -14 }
          ]
        },
        xpReward: 30
      }
    ],
    quizCard: {
      question: 'A company reports its highest-ever profit, yet its stock falls. What is the most likely reason?',
      options: [
        'Investors had expected even more, so the good news was already priced in',
        'A stock must always fall after good news',
        'The company has too many shareholders',
        'Profits do not matter to stock prices'
      ],
      correctIndex: 0,
      explanation: 'Prices already contain what investors expect. A result that is good but smaller than hoped, or that comes with weaker guidance, can disappoint — so the stock falls even on good news.'
    },
    briefs: [
      { emoji: '🤝', fact: 'Every stock trade has two sides — a buyer and a seller who agree on a price. If no one agrees, no trade happens, and the price does not move.' },
      { emoji: '📊', fact: 'India VIX, often called the "fear index", measures how much volatility traders expect over the near term — it tends to jump when markets are nervous.' },
      { emoji: '🎯', fact: 'Professional fund managers study the economy and companies full-time and still cannot reliably predict short-term moves — one reason diversification and a long horizon matter.' }
    ]
  }
};
