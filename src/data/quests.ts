/**
 * @fileOverview Deeply realistic, high-stakes financial quests for SpendXP.
 * Tailored for the Indian context with exact rupee consequences and cascading outcomes.
 */

import { AgeGroup } from '@/lib/ageAdapt';

export type QuestChoice = {
  id: string;
  text: string;
  consequence: string;
  xpDelta: number;
  healthDelta: number;
  walletDelta: number;
  nextStepId: string | 'end';
  isOptimal: boolean;
  explanation: string;
  realLifeTip?: string;
};

export type QuestStep = {
  id: string;
  title: string;
  narrative: string;
  amount?: number;
  choices: QuestChoice[];
  ageGroups: AgeGroup[];
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'housing' | 'debt' | 'emergency' | 'investing' | 'lifestyle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroups: AgeGroup[];
  estimatedMinutes: number;
  xpReward: number;
  startingBalance: number;
  steps: QuestStep[];
  /** Position in the learning path — lower = earlier. Defines the curriculum order. */
  chapterNumber: number;
  /** Section label shown as a divider in the quest list */
  chapter: string;
  badgeReward?: string;
  unlockRequirement?: {
    completedQuestId: string;
  };
};

export const quests: Quest[] = [

  // ─────────────────────────────────────────────────────────
  // JUNIOR QUESTS (ages 8–11)
  // ─────────────────────────────────────────────────────────
  {
    id: 'birthday-loot',
    title: 'The Birthday Loot',
    description: "You got ₹500 as a birthday gift! Treating friends to ice cream is totally expected on your birthday — AND you've been eyeing a ₹300 toy. The maths works if you plan. Can you be generous AND smart?",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['junior'],
    chapterNumber: 2,
    chapter: 'Saving Basics',
    estimatedMinutes: 3,
    xpReward: 80,
    startingBalance: 500,
    steps: [
      {
        id: 'bl-1',
        title: 'Plan Your Birthday Money',
        narrative: "You have ₹500. Your 4 friends are expecting a birthday treat — that's just what birthdays are! Ice cream for all 5 of you costs ₹150 (₹30 per cup). The toy you want is ₹300. Add it up: ₹150 + ₹300 = ₹450. You have ₹500. You CAN do both — but only if you plan first. What do you do?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c1',
            text: 'Quick check first: ice cream ₹150 + toy ₹300 = ₹450. I have ₹500. Let\'s go!',
            consequence: "Smart! You know the maths works. You treat your friends to ice cream — they love it! Now you head to the toy shop with ₹350 left. Time to pick your toy.",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: -150,
            nextStepId: 'bl-2-deluxe',
            isOptimal: true,
            explanation: "Planning for 30 seconds before spending means you can say YES to everything you want — treating friends AND buying your toy. When you know the numbers work, you can be generous AND smart at the same time.",
            realLifeTip: "Before spending, do a quick mental maths check: 'Can I do everything I want today?' If yes — enjoy fully! That's exactly what money is for."
          },
          {
            id: 'bl-c2',
            text: 'Treat friends first (₹150), then figure out the toy',
            consequence: "Friends are happy and treated! You have ₹350 left. Now to the toy shop — you got lucky that it works out, but you didn't check first.",
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -150,
            nextStepId: 'bl-2-toy',
            isOptimal: false,
            explanation: "It worked out this time! But spending without a quick check first can sometimes leave you short of something you really wanted. A 30-second maths check saves stress and regret.",
            realLifeTip: "Treating friends on your birthday is absolutely the right thing to do. Just do a quick check first: 'Do I have enough for everything?' If yes — treat freely!"
          },
          {
            id: 'bl-c3',
            text: 'Buy the toy first (₹300), then check if I can treat friends',
            consequence: "Toy secured! You have ₹200 left. Ice cream for 5 at ₹30 = ₹150 — you can still treat everyone AND have ₹50 left. You did it! Just in a different order.",
            xpDelta: 55,
            healthDelta: 10,
            walletDelta: -300,
            nextStepId: 'bl-2-icecream',
            isOptimal: false,
            explanation: "Securing your goal first and then being generous also works. But planning everything upfront gives you confidence and no stress — you know it works before you even start spending.",
            realLifeTip: "The order you spend in matters less than knowing the total adds up first. Check the full picture before you start."
          }
        ]
      },
      {
        id: 'bl-2-deluxe',
        title: 'Toy Shop Surprise!',
        narrative: "You're at the toy shop with ₹350 left (₹500 - ₹150 ice cream). The toy is ₹300 — you can afford it easily. But you notice a ₹500 deluxe version right next to it. The shopkeeper says it goes on sale next month for ₹350. What do you do?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c4',
            text: 'Buy the ₹300 toy now — I planned for this',
            consequence: "You buy it and have ₹50 left. You ended the day having treated your friends, bought your toy, and still have money. That's a perfect birthday!",
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -300,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Sticking to your plan when you've already thought it through is smart. You already decided this toy was worth it — no need to second-guess yourself.",
            realLifeTip: "A good plan gives you the confidence to enjoy spending without guilt. You planned it, so enjoy it fully!"
          },
          {
            id: 'bl-c5',
            text: 'Wait one month for the deluxe version (₹500 → ₹350 on sale)',
            consequence: "A month later: you get the ₹500 deluxe toy for ₹350! Same price, way better toy. Patience + information = getting more for your money.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "If you already know a sale is coming soon, waiting a few weeks gets you something much better for the same price. That's not missing out — that's smart timing.",
            realLifeTip: "Sales are real and predictable. Knowing when to wait vs. when to buy is a real skill that saves you thousands over your lifetime."
          }
        ]
      },
      {
        id: 'bl-2-toy',
        title: 'At the Toy Shop!',
        narrative: "You're at the toy shop with ₹350 left. The toy is ₹300. But there's also a ₹500 deluxe version going on sale next month for ₹350. What do you do?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c6',
            text: 'Buy the ₹300 toy — this is what I wanted',
            consequence: "You get the toy and still have ₹50 left. Full birthday achieved: friends treated, toy bought, money to spare!",
            xpDelta: 45,
            healthDelta: 8,
            walletDelta: -300,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You achieved everything you wanted on your birthday. That's a win! Next time, do the check first to avoid any stress.",
            realLifeTip: "Sometimes the simplest choice — getting exactly what you planned for — is the best one."
          },
          {
            id: 'bl-c7',
            text: 'Wait a month for the ₹500 deluxe version on sale at ₹350',
            consequence: "Next month you get the better toy for the same price you would have paid! Patience paid off.",
            xpDelta: 65,
            healthDelta: 12,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Using information about upcoming sales to time your purchase is excellent financial thinking.",
            realLifeTip: "If you know something is going on sale soon, waiting a few weeks can get you something much better for the same money."
          }
        ]
      },
      {
        id: 'bl-2-icecream',
        title: 'Ice Cream Time!',
        narrative: "Toy is safe! You head to the ice cream shop with ₹200 left. Your 4 friends are waiting. Ice cream for all 5 (₹30 each = ₹150 total). You have more than enough.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c8',
            text: 'Treat everyone — ₹150 for 5 cups of ice cream',
            consequence: "Friends are thrilled, the toy is safe at home, and you still have ₹50 left. Best. Birthday. Ever. 🎂",
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: -150,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You secured your goal AND still had room to be generous. When you plan ahead, you never have to choose between what you want and being kind to the people around you.",
            realLifeTip: "When you plan ahead, you can enjoy spending on people you care about with zero guilt. Generosity and smart money habits go together perfectly."
          }
        ]
      }
    ]
  },

  {
    id: 'pocket-money-puzzle',
    title: 'The Pocket Money Puzzle',
    description: "You get ₹200 pocket money every week. A comic set you love costs ₹550. Can you figure out when you can afford it?",
    category: 'income',
    difficulty: 'beginner',
    ageGroups: ['junior'],
    chapterNumber: 3,
    chapter: 'Saving Basics',
    estimatedMinutes: 3,
    xpReward: 80,
    startingBalance: 200,
    steps: [
      {
        id: 'pm-1',
        title: 'Week One',
        narrative: "You have ₹200. Your favourite candy bag is ₹50. A book costs ₹180. The comic set you want is ₹550. What do you buy this week?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'pm-c1',
            text: 'Buy the candy bag (₹50)',
            consequence: "Tasty! You have ₹150 left. If you save it, next week you will have ₹350.",
            xpDelta: 20,
            healthDelta: 3,
            walletDelta: -50,
            nextStepId: 'pm-2a',
            isOptimal: false,
            explanation: "Small treats are fine, but they slow down your bigger goal.",
            realLifeTip: "Ask yourself: 'Do I want this more than my bigger goal?'"
          },
          {
            id: 'pm-c2',
            text: 'Buy the book (₹180)',
            consequence: "Great choice! Books teach you things. You have ₹20 left. Next week you will have ₹220.",
            xpDelta: 35,
            healthDelta: 6,
            walletDelta: -180,
            nextStepId: 'pm-2b',
            isOptimal: false,
            explanation: "Books are good value, but your savings slowed down a bit.",
            realLifeTip: "Investing in learning is always good, just track your savings goal too."
          },
          {
            id: 'pm-c3',
            text: 'Save all ₹200 toward comic set',
            consequence: "Smart! No spending this week. You now have ₹200. Just 2 more weeks and you can afford the ₹550 comic set!",
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'pm-2c',
            isOptimal: true,
            explanation: "Saying 'not yet' to small things brings big things closer.",
            realLifeTip: "Every rupee you don't spend on something small gets you closer to something amazing."
          }
        ]
      },
      {
        id: 'pm-2a',
        title: 'Week Three: Almost There!',
        narrative: "It's week 3. You saved ₹150 last week + ₹200 this week = ₹350. You need ₹200 more for the comic. One more week of saving!",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'pm-c4',
            text: 'Save this week too — I am so close!',
            consequence: "Week 4: You have ₹550! You buy the full comic set! Worth every wait.",
            xpDelta: 70,
            healthDelta: 15,
            walletDelta: -550,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You planned, you waited, you achieved. That is what winners do.",
            realLifeTip: "Goals are just dreams with a deadline and a savings plan."
          },
          {
            id: 'pm-c5',
            text: 'Spend ₹100 on a game, keep going next week',
            consequence: "Fun game, but now you need one more week of saving. You get the comics in week 5 instead.",
            xpDelta: 30,
            healthDelta: 5,
            walletDelta: -100,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Small spends delay big goals. Sometimes worth it, sometimes not.",
            realLifeTip: "Track your goal date. Every extra spend = extra waiting time."
          }
        ]
      },
      {
        id: 'pm-2b',
        title: 'Week Three: Catching Up',
        narrative: "Week 3. You have ₹220 (₹20 from last week + ₹200 new). Comic set needs ₹550. You need ₹330 more — that's almost 2 more weeks.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'pm-c6',
            text: 'Save strictly for 2 more weeks',
            consequence: "Week 5: You have ₹620! You buy the comic set and have ₹70 left over!",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -550,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Even when you start slowly, consistent saving gets you there.",
            realLifeTip: "It is never too late to start saving."
          }
        ]
      },
      {
        id: 'pm-2c',
        title: 'Week Three: Almost There!',
        narrative: "Week 3. You have ₹400 (₹200 x 2). You need just ₹150 more. That is less than one week's pocket money!",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'pm-c7',
            text: 'Save one more week and buy it!',
            consequence: "Week 4: ₹600 saved! You buy the full comic set for ₹550 and have ₹50 to spare. GOAL ACHIEVED!",
            xpDelta: 100,
            healthDelta: 15,
            walletDelta: -550,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You saved for 4 weeks without giving up. That is real discipline!",
            realLifeTip: "The feeling of buying something you saved for yourself is 10x better."
          }
        ]
      }
    ]
  },

  {
    id: 'lemonade-stand',
    title: 'The Lemonade Stand',
    description: "Summer holidays! You want to earn your own money by selling lemonade. Can you run a tiny business?",
    category: 'income',
    difficulty: 'beginner',
    ageGroups: ['junior'],
    chapterNumber: 4,
    chapter: 'Earning More',
    estimatedMinutes: 4,
    xpReward: 120,
    startingBalance: 200,
    steps: [
      {
        id: 'ls-1',
        title: 'Setting Up Shop',
        narrative: "You have ₹200 to start. Lemons + sugar + cups cost ₹120. That makes 20 glasses. How much do you charge per glass?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'ls-c1',
            text: '₹5 per glass (cheap!)',
            consequence: "You sell all 20 glasses! You earn ₹100. But you spent ₹120. You lost ₹20!",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: -20,
            nextStepId: 'ls-2a',
            isOptimal: false,
            explanation: "Pricing too low means you lose money even when customers love you.",
            realLifeTip: "Always make sure your price covers your cost PLUS something extra. That extra is called profit."
          },
          {
            id: 'ls-c2',
            text: '₹10 per glass',
            consequence: "You sell 18 of 20 glasses. Earn ₹180. Spent ₹120. Profit: ₹60! Your first business profit!",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 60,
            nextStepId: 'ls-2b',
            isOptimal: true,
            explanation: "₹10 was fair for customers and profitable for you. Perfect balance.",
            realLifeTip: "Profit = money earned minus money spent. Always aim to earn more than you spend."
          },
          {
            id: 'ls-c3',
            text: '₹20 per glass',
            consequence: "People think it's too expensive! You only sell 8 glasses. Earn ₹160. Spent ₹120. Profit only ₹40.",
            xpDelta: 30,
            healthDelta: 3,
            walletDelta: 40,
            nextStepId: 'ls-2b',
            isOptimal: false,
            explanation: "Too high a price drives customers away — even if each sale gives more profit.",
            realLifeTip: "Finding the right price is a skill. Not too cheap, not too expensive."
          }
        ]
      },
      {
        id: 'ls-2a',
        title: 'Bouncing Back',
        narrative: "You lost ₹20 on day 1. But you learnt the lesson! Tomorrow, what price will you charge?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'ls-c4',
            text: '₹10 — cover costs and make profit',
            consequence: "Day 2: You sell all 20 glasses at ₹10. Profit ₹60. Total savings: ₹40. You turned a loss into a win!",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 60,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Learning from mistakes quickly is a superpower in business and in life.",
            realLifeTip: "Every failure has a lesson. The faster you apply it, the better."
          }
        ]
      },
      {
        id: 'ls-2b',
        title: 'What To Do With Profit?',
        narrative: "You made a profit! You have ₹60 (or ₹40) extra. Your friend asks to be your business partner and wants half. Your mum says save it.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'ls-c5',
            text: 'Give friend half the profit — team up!',
            consequence: "You keep ₹30, give ₹30. Tomorrow you both work together and sell twice as many glasses!",
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -30,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Sharing profit with a good partner can grow your business faster.",
            realLifeTip: "Partnerships work when both people contribute equally."
          },
          {
            id: 'ls-c6',
            text: 'Save all the profit yourself',
            consequence: "Smart! You bank your profit. Tomorrow you can buy more supplies and make even more lemonade.",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Reinvesting profit into your business helps it grow.",
            realLifeTip: "This is exactly how real businesses grow — reinvest before spending on yourself."
          },
          {
            id: 'ls-c7',
            text: 'Spend the profit on snacks',
            consequence: "Tasty! But tomorrow you have no extra money to buy more lemons. The stand closes.",
            xpDelta: 10,
            healthDelta: -3,
            walletDelta: -60,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Spending all your profit on yourself before reinvesting kills the business.",
            realLifeTip: "Pay your business first, then pay yourself."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  // TEEN QUESTS (ages 11–15)
  // ─────────────────────────────────────────────────────────
  {
    id: 'group-chat-dilemma',
    title: 'The Group Chat Pressure',
    description: "The squad wants pizza at a new place — ₹450 each. You have ₹700 left this month and your best friend's birthday is coming up. Social life AND smart spending? Let's figure it out.",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['teen'],
    chapterNumber: 5,
    chapter: 'Social & Spending',
    estimatedMinutes: 5,
    xpReward: 160,
    startingBalance: 700,
    steps: [
      {
        id: 'gcd-1',
        title: 'Friday Night Pizza',
        narrative: "Group chat explodes: 'Pizza Friday at Smoky's! ₹450 each.' You check your wallet — ₹700 left this month. Your best friend Meera's birthday is next Friday and you've been planning to get her that ₹300 book she keeps talking about. The pizza sounds genuinely fun. What do you do?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c1',
            text: 'Go for the full pizza (₹450) — it\'s Friday, we deserve it',
            consequence: "Great night out! You eat well, have a solid time with the group. You get home and check your wallet: ₹250 left. The book for Meera costs ₹300. You're ₹50 short with no income until next month.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -450,
            nextStepId: 'gcd-2a',
            isOptimal: false,
            explanation: "The pizza was real and the evening was worth it — that's the honest truth. But you didn't check if it left room for a commitment you'd already made. The issue isn't that you went out; it's that you didn't run the numbers first.",
            realLifeTip: "Before any social spend, do a 10-second check: 'Do I have anything important coming up this month that needs this money?' If yes, you can still join — just at a different price point."
          },
          {
            id: 'gcd-c2',
            text: "Suggest a cheaper spot — 'Guys, what about Amigo's? Way better value'",
            consequence: "Priya and Rohan agree immediately. Two others shrug and say 'sure.' You end up at a perfectly good place for ₹180 each. Solid food, same crew, same energy. You spend ₹180 and still have ₹520 left — plenty for Meera's gift and some to spare.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: -180,
            nextStepId: 'gcd-2b',
            isOptimal: true,
            explanation: "This is the actually underrated move — you're not saying no, you're redirecting. Most groups genuinely don't mind where they eat; they care about being together. Proposing an alternative is social confidence, not cheapness.",
            realLifeTip: "When you suggest an alternative rather than just declining, you stay in the plan, you set the terms, and you usually find most people are flexible. This skill scales well — it works in your 20s at restaurants, and in your 30s negotiating vendors."
          },
          {
            id: 'gcd-c3',
            text: "Skip this one — 'Can't make it tonight, saving for something'",
            consequence: "You sit this one out. It's a bit quiet at home while the chat fills with photos. You feel the pull, but you also wake up Saturday with your full ₹700 still intact — Meera's gift covered with room to spare. Most good friends genuinely get it when you're upfront about it.",
            xpDelta: 45,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'gcd-2b',
            isOptimal: false,
            explanation: "Skipping is a valid call and sometimes it's the right one. But it does have a mild social cost — especially if it becomes a habit. Done occasionally with a clear reason given, it's totally fine. Done every time, people stop inviting. The best long-term habit is building a social budget so you can say yes most of the time.",
            realLifeTip: "If you find yourself always skipping social plans for money reasons, the fix isn't to always say no — it's to build a monthly 'social fund' (even ₹200–300) that you can spend without guilt. Say yes to things within that budget; save the bigger splurges for special occasions."
          }
        ]
      },
      {
        id: 'gcd-2a',
        title: 'Meera\'s Birthday Problem',
        narrative: "You have ₹250 left. Meera's birthday is in 3 days. The book she's been wanting is ₹300. You're ₹50 short. You have a few options — some more creative than others.",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c4',
            text: 'Make her something personal — a playlist, a card with your actual memories together, something only you could give',
            consequence: "You spend an hour putting together something genuinely thoughtful — her favourite songs annotated with your shared memories, a handwritten note that actually says something. She tears up a little. 'This is better than any gift,' she says. Zero spent. Hard to replicate.",
            xpDelta: 65,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "A personal gift can land harder than any purchase — but only when it's genuinely thoughtful, not just cheap. The difference is effort and specificity. A vague card is awkward. A detailed, personal one is memorable. You knew Meera well enough to pull this off.",
            realLifeTip: "The best gifts are the ones that show you paid attention — not the ones that cost the most. If you know someone well, a personal, crafted gift often means more than something bought last-minute. But if you don't know them that well, a thoughtful small purchase is usually safer."
          },
          {
            id: 'gcd-c5',
            text: 'Get a ₹200 thing she\'d genuinely like — adjust the plan',
            consequence: "You find a small thing she actually likes for ₹200. It's not the book you planned, but it's something you know she'd enjoy. She's happy. You have ₹50 left as a micro-buffer.",
            xpDelta: 45,
            healthDelta: 6,
            walletDelta: -200,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Adapting your plan based on what you actually have is a genuine life skill. A well-chosen ₹200 gift that fits someone is better than a ₹300 gift chosen because of a number. The thought put into it matters more than the amount.",
            realLifeTip: "If your budget changes, don't just buy a random cheaper thing — take 10 minutes to think about what your actual budget CAN get them that they'd appreciate. The consideration is the gift."
          },
          {
            id: 'gcd-c6',
            text: 'Borrow ₹50 from home and get the original book',
            consequence: "Gift sorted! Meera gets the book. You owe ₹50 at home — remember to pay it back first thing next month before you spend anything else.",
            xpDelta: 25,
            healthDelta: 0,
            walletDelta: 50,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Small family loans in a pinch are fine — but they should be the last resort, not the first. And always pay back before your next social spend. The habit of borrowing casually and paying back slowly is how small debts become annoying ones.",
            realLifeTip: "If you do borrow ₹50, set a reminder right now to pay it back. The 'I'll remember to do it' approach usually turns ₹50 into a months-long awkward thing."
          }
        ]
      },
      {
        id: 'gcd-2b',
        title: 'The Gift Is Sorted — What Now?',
        narrative: "You navigated the pizza situation well. Meera's gift is covered and you have ₹300–₹500 left this month. A few days left to go. What do you do with what's remaining?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c7',
            text: 'Roll it forward — start next month with a head start',
            consequence: "Next month opens with ₹300–₹500 already saved. Suddenly you're not starting from zero. When the next pizza Friday or birthday gift situation comes up, you already have room. This is how a buffer is built.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Starting each month from zero is stressful. Starting each month with a cushion means social plans, unexpected costs, and gifts don't become emergencies. Rolling forward even ₹200 consistently creates real financial stability over time.",
            realLifeTip: "The best version of this habit: once you start earning, set up an auto-transfer on payday that moves a fixed amount out before you can see it. You spend what's left, and the savings grow without you thinking about it."
          },
          {
            id: 'gcd-c8',
            text: 'Use it for something you\'ve been wanting — you made smart calls this month',
            consequence: "You spend it on something you've actually been wanting. Zero guilt, because you planned well, covered your commitment, and the rest was genuinely yours to use. That's what a working budget feels like.",
            xpDelta: 45,
            healthDelta: 8,
            walletDelta: -300,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Spending what's left after your priorities are covered is not a mistake — it's the reward for having priorities at all. The goal isn't maximum saving; it's intentional spending where your choices reflect what you actually value.",
            realLifeTip: "A budget that never lets you enjoy money isn't a good budget — it's just delayed stress. Cover your essentials and commitments first, then spend what's left with zero guilt."
          }
        ]
      }
    ]
  },

  {
    id: 'first-side-hustle',
    title: 'Your First Side Hustle',
    description: "A neighbour offers to pay you ₹500 to design a birthday invitation. You have a talent. Do you take it — and what do you do with the money?",
    category: 'income',
    difficulty: 'intermediate',
    ageGroups: ['teen'],
    chapterNumber: 7,
    chapter: 'Building Income',
    estimatedMinutes: 6,
    xpReward: 200,
    startingBalance: 0,
    steps: [
      {
        id: 'fsh-1',
        title: 'The First Client',
        narrative: "Mrs Sharma from next door wants a birthday invite for her daughter. She offers ₹500. It will take you about 2 hours on Canva. Do you take it?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'fsh-c1',
            text: 'Yes! Take the job for ₹500',
            consequence: "Job done! ₹500 earned. That's ₹250 per hour. More than most adults' first jobs!",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 500,
            nextStepId: 'fsh-2',
            isOptimal: true,
            explanation: "Skills turn time into money. Design, coding, writing — all are sellable.",
            realLifeTip: "You have a skill others will pay for. That is the definition of a business."
          },
          {
            id: 'fsh-c2',
            text: 'Negotiate to ₹700 first',
            consequence: "She agrees to ₹600 after a short chat. You earned ₹100 more just by asking!",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 600,
            nextStepId: 'fsh-2',
            isOptimal: true,
            explanation: "Negotiating is a skill. The worst answer is no — and you're no worse off.",
            realLifeTip: "Always ask. You will be surprised how often people say yes."
          },
          {
            id: 'fsh-c3',
            text: 'Do it for free to build a portfolio',
            consequence: "Kind! But your time has value. Doing free work trains clients to expect free work.",
            xpDelta: 20,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'fsh-2',
            isOptimal: false,
            explanation: "Your skills have value. Charge for them — even a small amount.",
            realLifeTip: "Undervaluing yourself is a habit that follows you into adulthood."
          }
        ]
      },
      {
        id: 'fsh-2',
        title: 'Three More Requests',
        narrative: "Word spreads. Three more people want invites at ₹500 each. That is ₹1,500 more. But exams are in 3 weeks. What do you do?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'fsh-c4',
            text: 'Take all three jobs (₹1,500)',
            consequence: "You earn ₹1,500 but your exam prep suffers. You barely pass one subject. A costly trade-off.",
            xpDelta: 30,
            healthDelta: -5,
            walletDelta: 1500,
            nextStepId: 'fsh-3',
            isOptimal: false,
            explanation: "Income without priorities leads to short-term gain and long-term pain.",
            realLifeTip: "School results open long-term doors. Side hustles can wait — exams cannot."
          },
          {
            id: 'fsh-c5',
            text: 'Take only one job, decline the rest',
            consequence: "You earn ₹500 more, study well, and ace your exams. The clients respect your professionalism.",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 500,
            nextStepId: 'fsh-3',
            isOptimal: true,
            explanation: "Managing your capacity is just as important as finding opportunity.",
            realLifeTip: "Saying no to good things is how you make room for great things."
          },
          {
            id: 'fsh-c6',
            text: 'Decline all three until after exams',
            consequence: "Zero extra income now, but top exam results. Colleges notice. Your future earns far more.",
            xpDelta: 70,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'fsh-3',
            isOptimal: true,
            explanation: "Strategic patience is a real skill — knowing when to hustle and when to focus.",
            realLifeTip: "Seasons matter in money and in life. Know which season you are in."
          }
        ]
      },
      {
        id: 'fsh-3',
        title: 'What To Do With Your Earnings?',
        narrative: "You have earned between ₹500 and ₹2,000 from design work. What is the smartest move?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'fsh-c7',
            text: 'Save 70%, spend 30%',
            consequence: "Classic split! Save ₹350–₹1,400, spend ₹150–₹600. You are building the habit of a wealthy adult.",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "The 70/30 rule is used by financially successful people across the world.",
            realLifeTip: "Start the split habit now. Your older self will thank you."
          },
          {
            id: 'fsh-c8',
            text: 'Invest in a better design tool (₹299)',
            consequence: "Canva Pro unlocked! You can now charge ₹800 per design. Your rate went up 60%.",
            xpDelta: 70,
            healthDelta: 10,
            walletDelta: -299,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Investing in skills or tools that improve your output is excellent ROI.",
            realLifeTip: "The best investment a young person can make is in themselves."
          }
        ]
      }
    ]
  },

  {
    id: 'phone-plan-trap',
    title: 'The Phone Plan Trap',
    description: "Your parents ask you to split the phone bill. Plan A is ₹899/month (unlimited data). Plan B is ₹499/month (2GB/day). Which is actually smarter?",
    category: 'lifestyle',
    difficulty: 'intermediate',
    ageGroups: ['teen'],
    chapterNumber: 8,
    chapter: 'Smart Decisions',
    estimatedMinutes: 5,
    xpReward: 180,
    startingBalance: 1200,
    steps: [
      {
        id: 'pp-1',
        title: 'Pick Your Plan',
        narrative: "Plan A: ₹899/month — Unlimited data, all apps, no throttling. Plan B: ₹499/month — 2GB/day which is usually enough unless you stream HD video for 3+ hours.",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'pp-c1',
            text: 'Plan A — ₹899. Unlimited is always better.',
            consequence: "You have unlimited data. But you check your usage: you actually only used 1.6GB/day on average.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -899,
            nextStepId: 'pp-2a',
            isOptimal: false,
            explanation: "Paying for more than you use is wasted money — no matter how 'comfortable' it feels.",
            realLifeTip: "Check your actual data usage before choosing a plan."
          },
          {
            id: 'pp-c2',
            text: 'Plan B — ₹499. I will track my usage.',
            consequence: "Smart! 2GB/day is 60GB/month. You only used 48GB. The saving is ₹400/month.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: -499,
            nextStepId: 'pp-2b',
            isOptimal: true,
            explanation: "Matching your purchase to your actual needs — not your fears — is financial wisdom.",
            realLifeTip: "Check your screen time data. Most people use far less than they fear."
          }
        ]
      },
      {
        id: 'pp-2a',
        title: 'The 6-Month Reality Check',
        narrative: "6 months of Plan A: ₹5,394 spent. You used only 1.6GB/day on average. Plan B would have cost ₹2,994. You overspent by ₹2,400.",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'pp-c3',
            text: 'Switch to Plan B now',
            consequence: "You switch. In the next 6 months you save ₹2,400. Total damage: ₹2,400. Lesson learned.",
            xpDelta: 60,
            healthDelta: 8,
            walletDelta: 2400,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Switching when you identify waste is exactly the right move. Don't wait.",
            realLifeTip: "Audit your subscriptions every 6 months. Things change."
          },
          {
            id: 'pp-c4',
            text: 'Stay on Plan A — too much effort to switch',
            consequence: "Another 6 months pass. You have now overpaid ₹4,800 compared to Plan B. Laziness is expensive.",
            xpDelta: 5,
            healthDelta: -10,
            walletDelta: -2400,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Inaction is a financial decision. Choosing not to act costs real money.",
            realLifeTip: "A 10-minute phone call to switch plans can save thousands over a year."
          }
        ]
      },
      {
        id: 'pp-2b',
        title: 'Your ₹400 Monthly Saving',
        narrative: "You are saving ₹400/month by choosing Plan B. After 6 months that is ₹2,400 extra. What do you do with it?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'pp-c5',
            text: 'Save it in a separate goal fund',
            consequence: "₹2,400 becomes your 'Goals Fund'. In 12 months: ₹4,800. You can now buy something meaningful.",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Redirecting savings from waste into goals is how the wealthy build assets.",
            realLifeTip: "Name your savings goals. 'Laptop Fund', 'Trip Fund'. Named goals are achieved goals."
          },
          {
            id: 'pp-c6',
            text: 'Spend the ₹400 each month on fun',
            consequence: "Fair! You enjoy life and still pay less than Plan A. Better than before.",
            xpDelta: 40,
            healthDelta: 6,
            walletDelta: -2400,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Spending savings is better than overpaying, but saving beats both.",
            realLifeTip: "The power of ₹400/month is in what it becomes, not what it buys today."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  // EXISTING SENIOR QUESTS FOLLOW BELOW
  // ─────────────────────────────────────────────────────────
  {
    id: 'first-paycheck',
    title: 'Your First Salary: ₹35,000',
    description: 'You are 23, living in Bangalore. Your first paycheck just hit. Can you survive the month and still save?',
    category: 'income',
    difficulty: 'intermediate',
    ageGroups: ['teen', 'senior'],
    chapterNumber: 13,
    chapter: 'First Income',
    estimatedMinutes: 8,
    xpReward: 300,
    startingBalance: 35000,
    steps: [
      {
        id: 'fp-1',
        title: 'Payday Arrival',
        narrative: "It's the 1st of the month. Your salary of ₹35,000 is in. Your student loan EMI of ₹4,200 is due in 5 days, and your PG owner is asking for the ₹8,000 rent.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c1',
            text: 'Pay PG Rent + EMI immediately (₹12,200)',
            consequence: 'Smart. Your two non-negotiables are handled. You have ₹22,800 left to allocate.',
            xpDelta: 60,
            healthDelta: 8,
            walletDelta: -12200,
            nextStepId: 'fp-2-balanced',
            isOptimal: true,
            explanation: "Handling fixed obligations first protects your CIBIL score and housing security.",
            realLifeTip: "Set up Auto-Debit for EMIs. A single missed payment can drop your CIBIL score by 50+ points."
          },
          {
            id: 'c2',
            text: 'Transfer ₹10,000 to savings first',
            consequence: "Good instinct, but your EMI is due in 5 days. You have ₹25,000 remaining and must remember to pay the bills.",
            xpDelta: 50,
            healthDelta: 6,
            walletDelta: -10000,
            nextStepId: 'fp-2-saver',
            isOptimal: false,
            explanation: "Saving is great, but don't ignore immediate liquidity needs for committed bills.",
            realLifeTip: "The 'Pay Yourself First' rule works best when you already know your fixed costs."
          },
          {
            id: 'c3',
            text: 'Book a ₹6,000 trip with friends now — celebrate the first salary!',
            consequence: "Trip booked! The excitement is real and the celebration is valid. But you still owe ₹12,200 in bills. Only ₹16,800 remains for food and a full month of expenses — it's going to be tight.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -6000,
            nextStepId: 'fp-2-tight',
            isOptimal: false,
            explanation: "Celebrating your first salary is completely natural — the timing is the issue, not the trip itself. Spending on experiences before covering fixed obligations can leave you scrambling. Cover bills first, then plan the celebration with what's genuinely left over.",
            realLifeTip: "Build a 'Sinking Fund' for trips: save ₹1,500/month for 4 months, then book with money that's already set aside rather than taking it from your main salary. You still get the trip — without the month-end stress."
          }
        ]
      },
      {
        id: 'fp-2-balanced',
        title: 'The Tax Opportunity',
        narrative: "You have ₹22,800. PG and EMI paid. Now what? A colleague mentions that opening an NPS (National Pension System) account would save ₹15,600 in taxes this year under 80CCD(1B).",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c4',
            text: 'Invest ₹2,000/month in NPS',
            consequence: 'Tax saved! This ₹2,000/month could grow to ₹2.1 Crore by age 60.',
            xpDelta: 55,
            healthDelta: 7,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: "Starting retirement savings at 23 is a compounding superpower.",
            realLifeTip: "NPS is great for long-term, but ELSS mutual funds offer similar tax breaks with shorter lock-ins."
          },
          {
            id: 'c5',
            text: 'Open ELSS mutual fund (₹2,000)',
            consequence: 'ELSS gives the same tax deduction but unlocks in 3 years. More flexible than NPS.',
            xpDelta: 50,
            healthDelta: 6,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "ELSS is excellent for flexibility, though NPS has higher long-term compounding potential.",
            realLifeTip: "Under the Old Tax Regime, Section 80C lets you save tax on up to ₹1.5 Lakh of investments."
          },
          {
            id: 'c6',
            text: 'Skip retirement for now',
            consequence: "Waiting 5 years to start costs you ₹94 lakh in final corpus at 60 due to lost compounding.",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "The 'I have time' trap is the most expensive mistake in personal finance.",
            realLifeTip: "Compounding is a function of time. Starting small now beats starting big 10 years later."
          }
        ]
      },
      {
        id: 'fp-2-saver',
        title: 'The Saver Advantage',
        narrative: "You have ₹10,000 in savings and ₹15,000 for the month after bills. You're ahead of 80% of people your age already. How do you optimize your taxes?",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c7',
            text: 'Add ₹2,000/month to NPS',
            consequence: 'Perfect. You are building wealth and saving ₹3,120 in annual tax simultaneously.',
            xpDelta: 65,
            healthDelta: 8,
            walletDelta: -2000,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: "Aggressive tax-optimized saving early in career leads to massive wealth.",
            realLifeTip: "NPS Tier 1 has a mandatory lock-in until 60, making it a forced savings habit."
          },
          {
            id: 'c8',
            text: 'Stick to the ₹10,000 in savings',
            consequence: 'Safe, but you will pay more to the government instead of yourself at year-end.',
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Idle cash in a savings account loses value to inflation and missed tax breaks.",
            realLifeTip: "Use Section 80C to your advantage early."
          },
          {
            id: 'c9',
            text: 'Invest ₹5,000 in Stocks',
            consequence: 'Exciting, but you missed the tax break opportunity first. Efficiency matters.',
            xpDelta: 40,
            healthDelta: 4,
            walletDelta: -5000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Invest in tax-saving instruments (ELSS/NPS) before standard equity for higher net returns.",
            realLifeTip: "Always fill your 80C bucket before normal investing."
          }
        ]
      },
      {
        id: 'fp-2-tight',
        title: 'The Budget Crunch',
        narrative: "You have ₹16,800 for the month including bills. It's week 2. Swiggy/Zomato has cost ₹4,000. Your Ola/Uber has cost ₹2,800. You have ₹10,000 left for 2 weeks.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c10',
            text: 'Cook at home, use public transport',
            consequence: 'You save ₹3,000 this month. Your wallet breathes again.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'fp-3',
            isOptimal: true,
            explanation: "Aggressive correction when spending goes off-track is vital for financial health.",
            realLifeTip: "Meal prep on Sundays can save the average Indian professional ₹6,000/month."
          },
          {
            id: 'c11',
            text: 'Use credit card for shortfall',
            consequence: "You spent ₹2,400 on the credit card at 36% APR. That ₹2,400 becomes ₹2,472 after 30 days.",
            xpDelta: 10,
            healthDelta: -12,
            walletDelta: -2400,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Using credit to fund lifestyle gaps is a debt trap that's hard to escape.",
            realLifeTip: "Credit card debt is the most expensive debt. Never use it for daily survival."
          },
          {
            id: 'c12',
            text: 'Ask family for ₹3,000',
            consequence: 'They help, but you have a social debt to pay back next month. The cycle continues.',
            xpDelta: 20,
            healthDelta: -2,
            walletDelta: 3000,
            nextStepId: 'fp-3',
            isOptimal: false,
            explanation: "Borrowing from family solves the symptom but not the habit of overspending.",
            realLifeTip: "Track every rupee for 30 days to see your real leaks."
          }
        ]
      },
      {
        id: 'fp-3',
        title: 'Design Your Financial Life',
        narrative: "Month 3. You've tracked your spending: Swiggy ₹3,200, Zomato ₹1,800, Uber ₹4,100, Amazon ₹2,900. Total lifestyle spend: ₹12,000/month. Now the real question — is this the life you actually want? Or are these just defaults you drifted into?",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'c13',
            text: 'Design intentional spending: keep what matters, cut what doesn\'t',
            consequence: "You decide: Uber stays (2 hours of commute saved = real productivity). Swiggy cut to ₹1,200 (2 nice meals a week, not daily laziness). Amazon reduced to planned purchases only. Net saving: ₹4,500/month — without feeling deprived.",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Intentional spending means you consciously choose what brings real value versus what's just a default habit. The goal isn't to spend as little as possible — it's to spend on what genuinely improves your life, and cut what doesn't.",
            realLifeTip: "Go through last month's transactions and mark each as: 'worth it', 'habit', or 'mistake'. You'll immediately see where to cut — and what to keep guilt-free. Money spent on things that genuinely matter to you is never wasted."
          },
          {
            id: 'c14',
            text: 'Focus on earning more instead of cutting more',
            consequence: "You ask your manager for a 15% raise and start a ₹8,000/month design freelance project on weekends. Suddenly the ₹12,000 lifestyle spend is just 20% of income, not 34%. The lifestyle doesn't change — the income does.",
            xpDelta: 75,
            healthDelta: 12,
            walletDelta: 8000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Cutting spending has a hard floor — you can only cut so much before life becomes unpleasant. But income growth has no ceiling. After covering basics and saving a healthy %, growing income is often the highest-leverage financial move available.",
            realLifeTip: "Every ₹1,000/month raise, compounded over 10 years at 12%, produces ₹23 lakh in additional wealth. A salary negotiation that takes 20 minutes has more financial impact than years of skipping coffee."
          },
          {
            id: 'c15',
            text: 'Cut everything — ₹5,500 hard cap on lifestyle',
            consequence: "You save ₹6,500/month, but by month 5 you're burned out and resentful. Extreme restriction causes a 'rebound spend' in month 6 — ₹22,000 in one weekend. Net result: worse than starting.",
            xpDelta: 25,
            healthDelta: -8,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Overly aggressive expense cutting often leads to rebound spending. Financial plans that feel like punishment don't last. Sustainability beats optimisation every time.",
            realLifeTip: "The best financial plan is one you can actually stick to. Give yourself a guilt-free 'fun fund' each month — even if it's small. Restriction without release builds pressure that eventually explodes."
          }
        ]
      }
    ]
  },
  {
    id: 'first-apartment',
    title: 'Your First Apartment',
    description: "You landed your first real job (₹55,000/month). Now you need a place to live. The city is expensive — can you find a home without going broke?",
    category: 'housing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    chapterNumber: 16,
    chapter: 'Housing',
    estimatedMinutes: 10,
    xpReward: 350,
    startingBalance: 90000,
    steps: [
      {
        id: 'ra-1',
        title: 'Choosing Where to Live',
        narrative: "Your office is downtown. You have ₹90,000 in savings. Renting close to work is expensive — but commuting far drains your time and energy.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c1',
            text: 'Shared room near office: ₹18,000',
            consequence: 'High rent, but ₹0 commute and utilities included. Deposit: ₹18,000.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -18000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "Good for time management, but eats 33% of salary. Tight but manageable for a first job.",
            realLifeTip: "Commute time is money. Living close can save you 100+ hours of travel a month."
          },
          {
            id: 'ra-c2',
            text: 'Shared flat across town: ₹12,500',
            consequence: 'Low rent (23% of salary). Deposit: ₹37,500. 45-min commute each way.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -37500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: "Housing under 25% of salary is the gold standard for early wealth building.",
            realLifeTip: "Use the 3:1 income-to-rent ratio rule — your income should be at least 3× your monthly rent."
          },
          {
            id: 'ra-c3',
            text: 'Own studio in far suburb: ₹22,000',
            consequence: 'Your own space, but 40% of salary. Deposit: ₹66,000. Long commute adds up.',
            xpDelta: 20,
            healthDelta: -8,
            walletDelta: -66000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "Spending 40%+ on rent is the 'house poor' trap. Your savings will stagnate.",
            realLifeTip: "Always plan for 2–3 months' rent in deposit upfront when moving to a new city."
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Agent Problem',
        narrative: "The letting agent wants 1 month's rent as a finder's fee. This is on top of your deposit.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c4',
            text: 'Negotiate the fee to 50%',
            consequence: 'Success! You save ₹6,250–₹11,000. Most people never ask.',
            xpDelta: 55,
            healthDelta: 8,
            walletDelta: -6250,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Agent fees are negotiable. A short conversation saved you over a week's salary.",
            realLifeTip: "Agents are more willing to negotiate if you can sign and pay quickly."
          },
          {
            id: 'ra-c5',
            text: 'Find a no-fee listing directly (₹0)',
            consequence: 'Saves ₹12,500–₹22,000 but takes 2 extra weeks to find a place.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Avoiding middleman fees preserves your capital — time spent is worth it.",
            realLifeTip: "Direct landlord listings are rarer but always worth checking first."
          },
          {
            id: 'ra-c6',
            text: 'Pay full fee to secure it fast',
            consequence: 'Flat secured quickly! But your savings are now dangerously low with no buffer.',
            xpDelta: 15,
            healthDelta: -4,
            walletDelta: -12500,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: "Accepting high upfront costs without negotiating drains your emergency fund.",
            realLifeTip: "Always keep a 'Move-in Fund' separate from your security deposit."
          }
        ]
      },
      {
        id: 'ra-3',
        title: 'The Lease Trap',
        narrative: "Clause 7: rent increases 10% on renewal. Clause 12: tenant pays all repair costs under ₹5,000.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c7',
            text: 'Negotiate Clause 12 limit down to ₹2,000',
            consequence: 'Saves you ₹3,000 per repair event. Landlord also agreed to a 5% cap on rent hikes.',
            xpDelta: 70,
            healthDelta: 9,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Leases are negotiable documents. Pushing back now saves thousands over the tenancy.",
            realLifeTip: "Landlords often include aggressive clauses just to see if you'll sign without reading."
          },
          {
            id: 'ra-c8',
            text: 'Sign without reading fully',
            consequence: "Month 3: pipe bursts. Repair costs ₹3,200 — Clause 12 means you pay it. Month 11: rent jumps ₹2,200.",
            xpDelta: 5,
            healthDelta: -8,
            walletDelta: -3200,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Signing contracts without reading them is a recurring and expensive financial mistake.",
            realLifeTip: "Never sign a lease without reading every clause. Ask a friend or look up tenant rights in your country."
          },
          {
            id: 'ra-c9',
            text: 'Accept the terms as written',
            consequence: "You have the place, but you've accepted high maintenance risk and uncapped rent increases.",
            xpDelta: 25,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Failing to push back on boilerplate terms leaves recurring money on the table.",
            realLifeTip: "Normal wear and tear should always be the landlord's responsibility — not yours."
          }
        ]
      }
    ]
  },
  {
    id: 'phone-emi',
    title: 'The ₹60,000 Smartphone',
    description: 'You really want the new iPhone. Your salary is ₹40,000. Do you use "No Cost" EMI or wait?',
    category: 'debt',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    chapterNumber: 12,
    chapter: 'Debt Awareness',
    estimatedMinutes: 5,
    xpReward: 200,
    startingBalance: 15000,
    steps: [
      {
        id: 'p-1',
        title: 'The Deal',
        narrative: "iPhone 15 is ₹60,000. Amazon offers 'No Cost EMI' for ₹5,000/month for 12 months. You have ₹15,000 saved.",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'p-c1',
            text: 'Save ₹10,000/mo for 5 months',
            consequence: 'You buy it in 5 months with cash. No debt. Savings stay intact.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Sinking funds prevent your future income from being locked in debt.",
            realLifeTip: "'No Cost' EMI often has hidden processing fees and GST on the interest component."
          },
          {
            id: 'p-c2',
            text: 'Take the 12-month EMI today',
            consequence: 'You have the phone! But ₹5,000 of your salary is GONE every month for a year.',
            xpDelta: 20,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Debt for depreciating assets (phones) is the fastest way to stay poor.",
            realLifeTip: "If you can't buy it twice in cash, you can't afford it."
          },
          {
            id: 'p-c3',
            text: 'Buy a used model for ₹30,000',
            consequence: 'Great value. You save ₹30,000 and own it today without an EMI.',
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: -30000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Second-hand purchases are high-value for tech, but the ₹30k hit to savings is large.",
            realLifeTip: "Check battery health before buying used iPhones."
          }
        ]
      }
    ]
  },
  {
    id: 'emergency-expense',
    title: 'The Pink Slip Surprise',
    description: 'A sudden layoff hits. You have 30 days of pay left. How long can you survive?',
    category: 'emergency',
    difficulty: 'intermediate',
    ageGroups: ['senior'],
    chapterNumber: 14,
    chapter: 'Safety Net First',
    estimatedMinutes: 7,
    xpReward: 300,
    startingBalance: 120000,
    steps: [
      {
        id: 'efq-1',
        title: 'The Layoff Notice',
        narrative: "Your startup closed. You get 1 month severance (₹40,000). You have ₹1,20,000 in total savings.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'efq-c1',
            text: 'Cut all luxury immediately',
            consequence: 'Expenses drop to ₹20,000. Your savings now last 8 months instead of 5.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Surviving a layoff is about extending your 'runway' as much as possible.",
            realLifeTip: "The first thing to cut is subscriptions and dining out. These are pure variable costs."
          },
          {
            id: 'efq-c2',
            text: 'Maintain lifestyle for morale',
            consequence: 'You stay happy, but you only have 5 months to find a job or move back home.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Denial is expensive. High fixed costs are your enemy during unemployment.",
            realLifeTip: "Morale comes from security. Security comes from having a 6-month buffer."
          },
          {
            id: 'efq-c3',
            text: 'Start freelancing immediately',
            consequence: 'Brings in ₹10,000/mo. Extends your survival by 2 months.',
            xpDelta: 50,
            healthDelta: 7,
            walletDelta: 40000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Income diversification prevents total depletion during job gaps.",
            realLifeTip: "Never rely on a single source of income."
          }
        ]
      }
    ]
  },
  {
    id: 'vacation-planning',
    title: 'Bali Dream vs. Gokarna Reality',
    description: "You've been working hard for months and you need a real break. Bali costs ₹80,000. Gokarna costs ₹15,000. You have ₹45,000 saved in your travel fund. Both trips are valid — the question is how you fund them.",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    chapterNumber: 11,
    chapter: 'Build Your Life',
    estimatedMinutes: 6,
    xpReward: 250,
    startingBalance: 45000,
    steps: [
      {
        id: 'vp-1',
        title: 'You Deserve a Break',
        narrative: "You have been grinding for months. Rest isn't optional — it's part of performing well long-term. Bali is your dream trip (₹80,000). Gokarna is achievable right now (₹15,000). You have ₹45,000 saved. What's the smart play?",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'vp-c1',
            text: 'Go to Gokarna now (₹15,000)',
            consequence: "An incredible trip — sunsets, beaches, real rest. You return recharged with ₹30,000 still in your fund. The Bali trip is still coming.",
            xpDelta: 60,
            healthDelta: 15,
            walletDelta: -15000,
            nextStepId: 'vp-2',
            isOptimal: true,
            explanation: "Taking a real break fuels better performance at work. Rest is productive. Gokarna gives you a genuine reset without touching your financial safety net.",
            realLifeTip: "Lesser-known destinations often deliver 90% of the experience for 20% of the cost — and far less crowds. The goal isn't the destination, it's the restoration."
          },
          {
            id: 'vp-c2',
            text: 'Keep saving specifically for Bali',
            consequence: "You map out a plan: save ₹9,000/month, reach Bali in 4 months. You book it, and it's everything you imagined — because you planned it, not because you panicked into it.",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'vp-2',
            isOptimal: true,
            explanation: "Intentional saving for a specific experience you genuinely want is exactly how balanced financial planning works. You didn't cut the dream — you funded it properly.",
            realLifeTip: "A 'Sinking Fund' is a dedicated savings bucket for planned big expenses — travel, gadgets, courses. Set one up and automate ₹X/month into it so your dream trips never feel guilty."
          },
          {
            id: 'vp-c3',
            text: 'Book Bali on Credit Card (worry later)',
            consequence: "Bali was incredible — but the ₹35,000 shortfall on a 36% APR card turns into ₹47,000 after six months. The trip is over but the debt hangs around.",
            xpDelta: 10,
            healthDelta: -15,
            walletDelta: -35000,
            nextStepId: 'vp-2',
            isOptimal: false,
            explanation: "The problem isn't wanting Bali — it's funding Bali with debt you can't quickly clear. Credit card interest at 36% APR is the most expensive money you'll ever spend.",
            realLifeTip: "If the trip requires high-interest debt to fund, the trip hasn't been earned yet. That's not a value judgment — it's math. Save first, enjoy second."
          }
        ]
      },
      {
        id: 'vp-2',
        title: 'The Bigger Question',
        narrative: "After the trip (or your planning session), you realise something: the travel fund only exists because you set it up. Most people don't. How do you make sure you can always afford the life you want?",
        ageGroups: ['senior', 'teen'],
        choices: [
          {
            id: 'vp-c4',
            text: 'Design a "lifestyle budget" — allocate for travel, fun AND savings',
            consequence: "You create three buckets: 50% essentials, 20% savings/investing, 30% life (travel, food, clothes, experiences). Every rupee has a job. The guilt disappears because the plan is intentional.",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "The 50/20/30 framework works because it treats 'life' as a legitimate budget category — not a guilty afterthought. Financial health isn't about spending as little as possible. It's about spending intentionally.",
            realLifeTip: "Budgets fail when they're too restrictive. Build your fun into the plan, or the plan breaks. A sustainable financial life includes vacations, dinners out, and hobbies — funded deliberately."
          },
          {
            id: 'vp-c5',
            text: 'Focus on earning more so travel is never a dilemma',
            consequence: "You start upskilling, negotiate a raise, or begin a side income. When your monthly savings rate rises from 10% to 25%, Bali stops being a stretch — it becomes a quarterly option.",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Cutting spending has a floor. Increasing income has no ceiling. The best financial move beyond basic savings is growing the income side — skills, raises, side work, or smart career moves.",
            realLifeTip: "A ₹5,000/month raise compounding over 10 years does more for your wealth than ₹5,000/month of cutting. Invest in your career and skills with the same seriousness you invest in mutual funds."
          }
        ]
      }
    ]
  },
  {
    id: 'first-credit-card',
    title: 'The Rewards Trap',
    description: 'You got your first credit card with a ₹50,000 limit. "10% Reward points" sounds like free money.',
    category: 'debt',
    difficulty: 'intermediate',
    ageGroups: ['senior'],
    chapterNumber: 15,
    chapter: 'Credit',
    estimatedMinutes: 7,
    xpReward: 300,
    startingBalance: 20000,
    steps: [
      {
        id: 'fcc-1',
        title: 'The Big Purchase',
        narrative: "A new laptop is ₹45,000. Your card gives 10x points. You have ₹20,000 in your bank account.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'fcc-c1',
            text: 'Buy ₹20,000 laptop in cash',
            consequence: 'Basic but functional. 0 debt. Your ₹20,000 is still yours.',
            xpDelta: 50,
            healthDelta: 10,
            walletDelta: -20000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Buying what you can afford beats chasing points with money you don't have.",
            realLifeTip: "Credit card points are worth ~1-2% in reality, not 10% cash value."
          },
          {
            id: 'fcc-c2',
            text: 'Buy ₹45,000 laptop on card',
            consequence: 'You owe ₹25,000 more than you have. Points worth: ₹450.',
            xpDelta: 20,
            healthDelta: -12,
            walletDelta: -45000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "You earned ₹450 in points but will pay ₹875 in interest in month one.",
            realLifeTip: "Never spend on credit unless you have the cash today."
          },
          {
            id: 'fcc-c3',
            text: 'Wait 3 months, buy in cash',
            consequence: 'The best financial choice. No debt, and you might get a better deal later.',
            xpDelta: 60,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Avoiding high-interest consumer debt is the fastest way to wealth.",
            realLifeTip: "Sales happen every 3 months. Patience saves more than points."
          }
        ]
      }
    ]
  },
  {
    id: 'calculations-quest',
    title: 'The Math of Money: Projections',
    description: 'Can you calculate your way to wealth? Test your ability to project returns and understand inflation.',
    category: 'investing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    chapterNumber: 17,
    chapter: 'Investing',
    estimatedMinutes: 10,
    xpReward: 400,
    startingBalance: 50000,
    steps: [
      {
        id: 'mq-1',
        title: 'The Inflation Stealth',
        narrative: "You have ₹50,000 in a Fixed Deposit earning 6% interest. Inflation in India is 5.5%. After one year, how much did your wealth grow in real purchasing power?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c1',
            text: 'It grew by 6% (₹3,000)',
            consequence: "That is your 'Nominal' growth. Your real gain is almost invisible.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 3000,
            nextStepId: 'mq-2',
            isOptimal: false,
            explanation: "Nominal returns are a vanity metric. Real returns are what build wealth.",
            realLifeTip: "If your return equals inflation, your lifestyle stays the same forever."
          },
          {
            id: 'mq-c2',
            text: 'It grew by 0.5% (₹250)',
            consequence: "Correct! Your 'Real Rate of Return' is 0.5%. Money just barely kept its value.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 250,
            nextStepId: 'mq-2',
            isOptimal: true,
            explanation: "Real return calculation: (1 + Nominal)/(1 + Inflation) - 1.",
            realLifeTip: "Always subtract inflation from your return rate."
          },
          {
            id: 'mq-c3',
            text: 'It lost value',
            consequence: "Not quite, but close. 0.5% is so low it feels like losing value.",
            xpDelta: 30,
            healthDelta: 2,
            walletDelta: 250,
            nextStepId: 'mq-2',
            isOptimal: false,
            explanation: "You technically gained power, but not enough to change your life.",
            realLifeTip: "Investing in equity is the only reliable way to beat 6% inflation."
          }
        ]
      },
      {
        id: 'mq-2',
        title: 'Personal Loan Math',
        narrative: "₹1,00,000 bike loan at 14% for 2 years. Monthly EMI is ₹4,801. How much interest will you pay in total?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c4',
            text: '₹14,000',
            consequence: "Incorrect. That assumes you pay once at the end. Reducing balance is different.",
            xpDelta: 10,
            healthDelta: -5,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: false,
            explanation: "Personal loan interest is calculated on a reducing balance.",
            realLifeTip: "Ask for an Amortization Schedule before signing."
          },
          {
            id: 'mq-c5',
            text: '₹15,224',
            consequence: "Correct! You pay ₹15,224 extra just to have the bike 2 years earlier.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: true,
            explanation: "Total interest = (EMI * Tenure) - Principal.",
            realLifeTip: "Calculate Total Cost of Ownership including interest."
          },
          {
            id: 'mq-c6',
            text: '₹28,000',
            consequence: "Too high! 14% is yearly, not monthly. Still, the real cost is high.",
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: -15224,
            nextStepId: 'mq-3',
            isOptimal: false,
            explanation: "Don't overestimate, but don't ignore the reduced balance math.",
            realLifeTip: "Reducing balance EMI is cheaper than flat rate, but still expensive."
          }
        ]
      },
      {
        id: 'mq-3',
        title: 'The Rule of 72',
        narrative: "You invest ₹50,000 in a Nifty 50 Index fund returning 12% annually. How long until it doubles to ₹1,00,000?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c7',
            text: '6 years',
            consequence: 'Correct! 72 / 12 = 6 years. A vital wealth-building shortcut.',
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: true,
            explanation: "The Rule of 72 estimates doubling time by dividing 72 by the rate.",
            realLifeTip: "Want to double in 4 years? You need an 18% return."
          },
          {
            id: 'mq-c8',
            text: '8.3 years',
            consequence: 'Incorrect. Compounding makes it happen faster than simple division.',
            xpDelta: 20,
            healthDelta: 0,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: false,
            explanation: "Compounding accelerates doubling exponentially.",
            realLifeTip: "Rule of 72 works for debt too. 24% credit debt doubles in 3 years."
          },
          {
            id: 'mq-c9',
            text: '12 years',
            consequence: 'Too slow! At 12%, you gain speed every year.',
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: 50000,
            nextStepId: 'mq-4',
            isOptimal: false,
            explanation: "Compounding is faster than you think.",
            realLifeTip: "Start early to let the curve do the work."
          }
        ]
      },
      {
        id: 'mq-4',
        title: 'The New Tax Bite (LTCG)',
        narrative: "Budget 2024: Long Term Capital Gains (LTCG) above ₹1.25 Lakh are taxed at 12.5%. You gained ₹2,00,000 in 2 years. What is the tax?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c10',
            text: '₹25,000',
            consequence: "Wait! You forgot the exemption. You only pay on the amount ABOVE ₹1.25 Lakh.",
            xpDelta: 10,
            healthDelta: -2,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: false,
            explanation: "Tax: (2,00,000 - 1,25,000) * 0.125 = ₹9,375.",
            realLifeTip: "Tax-harvesting within the limit saves lakhs over a lifetime."
          },
          {
            id: 'mq-c11',
            text: '₹9,375',
            consequence: "Correct! Using the ₹1.25 Lakh exemption accurately preserves your wealth.",
            xpDelta: 100,
            healthDelta: 12,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: true,
            explanation: "Knowing tax thresholds prevents over-budgeting for liability.",
            realLifeTip: "Track your NAV to calculate true tax liability."
          },
          {
            id: 'mq-c12',
            text: '₹0',
            consequence: "Incorrect. You are well above the ₹1.25L tax-free limit.",
            xpDelta: 5,
            healthDelta: -5,
            walletDelta: -9375,
            nextStepId: 'mq-5',
            isOptimal: false,
            explanation: "Tax avoidance is legal; tax evasion is not.",
            realLifeTip: "LTCG applies after holding for 12 months in equity."
          }
        ]
      },
      {
        id: 'mq-5',
        title: 'Credit Card Debt Cycle',
        narrative: "You owe ₹20,000 at 3.5% monthly interest (42% APR). You pay only the ₹1,000 minimum. How much debt did you clear?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'mq-c13',
            text: '₹300',
            consequence: "Exactly. ₹700 of your hard-earned money went straight to the bank's profit.",
            xpDelta: 100,
            healthDelta: 10,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "3.5% of ₹20,000 is ₹700. Only ₹300 reduces your debt.",
            realLifeTip: "Paying minimum is a 'Subscription to Debt'."
          },
          {
            id: 'mq-c14',
            text: '₹1,000',
            consequence: "Incorrect. Interest was stolen before it ever reached your principal.",
            xpDelta: 0,
            healthDelta: -15,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Interest always eats the first chunk of your payment.",
            realLifeTip: "Credit debt at 42% is a financial emergency."
          },
          {
            id: 'mq-c15',
            text: '₹500',
            consequence: "Close, but the math is worse. ₹700 went to interest.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "The high APR makes minimum payments nearly useless.",
            realLifeTip: "Transfer high-rate card debt to a personal loan if you can't pay in full."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  // LIFESTYLE DESIGN QUEST — Build the life you want, then fund it
  // ─────────────────────────────────────────────────────────
  {
    id: 'lifestyle-design',
    title: 'Design Your Ideal Life First',
    description: "Most people build their lifestyle around their income. The wealthy do the opposite — they design the life they want, then engineer the income to fund it. This quest teaches you how.",
    category: 'income',
    difficulty: 'intermediate',
    ageGroups: ['teen', 'senior'],
    chapterNumber: 10,
    chapter: 'Build Your Life',
    estimatedMinutes: 8,
    xpReward: 320,
    startingBalance: 0,
    steps: [
      {
        id: 'ld-1',
        title: 'Start With the Life, Not the Budget',
        narrative: "You're 24. Someone asks: 'What does your ideal month look like in 5 years?' Most people say 'I don't know — I'll figure out what I can afford.' But there's a more powerful starting point. What do you actually want?",
        ageGroups: ['teen', 'senior'],
        choices: [
          {
            id: 'ld-c1',
            text: 'Define the life: apartment, travel once a quarter, good food, investing ₹15,000/month',
            consequence: "You map it out: rent ₹20,000, food ₹8,000, travel fund ₹10,000/month, investing ₹15,000, miscellaneous ₹7,000. Total needed: ₹60,000/month take-home. Now you have a target income — not a vague hope.",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'ld-2',
            isOptimal: true,
            explanation: "Working backwards from your ideal life to the income required is called 'Lifestyle Design'. It turns a fuzzy feeling into a concrete financial goal. You stop asking 'can I afford this?' and start asking 'what income makes this automatic?'",
            realLifeTip: "Write out your ideal month in detail — not a fantasy, a genuine good life. Add up the costs. That number is your Target Monthly Income (TMI). Everything you do financially — salary negotiation, side hustles, investments — should aim at closing the gap to that number."
          },
          {
            id: 'ld-c2',
            text: 'Figure out what I can save from my current salary first',
            consequence: "You save ₹5,000/month from a ₹35,000 salary. It feels responsible, but you've built your life around scarcity rather than possibility. In 5 years you have ₹3 lakh saved — but still feel stuck at the same level.",
            xpDelta: 30,
            healthDelta: 5,
            walletDelta: 0,
            nextStepId: 'ld-2',
            isOptimal: false,
            explanation: "Optimising around what you already earn keeps you anchored to your current ceiling. There's nothing wrong with saving ₹5,000 — but if your life requires ₹60,000/month and you're earning ₹35,000, you need an income plan, not just a savings plan.",
            realLifeTip: "Savings rate matters, but so does the base. 20% of ₹35,000 is ₹7,000. 20% of ₹80,000 is ₹16,000. Growing your income is not greed — it's the most effective financial lever you have."
          }
        ]
      },
      {
        id: 'ld-2',
        title: 'The Gap Analysis',
        narrative: "You need ₹60,000/month (take-home) to fund the life you designed. You currently earn ₹38,000 (take-home). The gap is ₹22,000/month. How do you close it?",
        ageGroups: ['teen', 'senior'],
        choices: [
          {
            id: 'ld-c3',
            text: 'Negotiate a raise — you\'re worth more than you\'re being paid',
            consequence: "You research market salaries on Glassdoor. You're 18% below market. You request a meeting, present your contributions, and ask for 20% more. You get 12% — ₹4,560/month more. Not the full gap, but a real start.",
            xpDelta: 75,
            healthDelta: 12,
            walletDelta: 4560,
            nextStepId: 'ld-3',
            isOptimal: true,
            explanation: "The average raise without negotiating is 3-5%. The average raise after negotiating is 10-20%. The ask takes 20 minutes and feels terrifying — but it compounds for the rest of your career. Every rupee of raise you get now means more raises on a higher base forever.",
            realLifeTip: "Before any salary conversation: research your market rate (Glassdoor, LinkedIn), list 3-5 specific contributions you've made, and anchor high — ask for 20% knowing you might land at 12%. Never accept the first offer without at least one counter."
          },
          {
            id: 'ld-c4',
            text: 'Start a weekend side income using your existing skills',
            consequence: "You teach online (₹4,000/month), do freelance design work (₹6,000/month), or tutor students (₹5,000/month). In 3 months your side income is ₹8,000/month, covering a third of the gap.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 8000,
            nextStepId: 'ld-3',
            isOptimal: true,
            explanation: "A side income built on existing skills has near-zero startup cost and near-infinite upside. The first month is hard. By month 6, it often feels like a natural extension of your week. Most people have at least one skill others will pay for — design, writing, teaching, coding, even organising.",
            realLifeTip: "Sell before you build. Before creating a course or product, find 3 people who will pay for your help directly. Proven demand first, then scale. Platforms: Toppr, Unacademy, Fiverr, local Facebook groups, or just WhatsApp contacts."
          },
          {
            id: 'ld-c5',
            text: 'Cut spending aggressively to match the gap',
            consequence: "You cut food, transport, and everything 'nice'. You save ₹8,000 more — but life feels joyless. After 4 months, you're burning out and resenting the process.",
            xpDelta: 20,
            healthDelta: -8,
            walletDelta: 0,
            nextStepId: 'ld-3',
            isOptimal: false,
            explanation: "Cutting spending has a floor — you can only cut so far before it affects your quality of life and performance at work. For a ₹22,000/month gap, you need income growth, not expense elimination. The two aren't enemies — but one is far more powerful.",
            realLifeTip: "Cut wasteful spending, absolutely. But don't cut the things that fuel your energy, focus, and wellbeing. A gym membership that keeps you healthy and sharp is not a luxury — it's an investment in your earning capacity."
          }
        ]
      },
      {
        id: 'ld-3',
        title: 'Invest in Your Biggest Asset',
        narrative: "You've started closing the income gap. Now: your salary will only grow as fast as your skills grow. You have ₹8,000 to invest this month. Where does it go?",
        ageGroups: ['teen', 'senior'],
        choices: [
          {
            id: 'ld-c6',
            text: 'Upskill: online course in your field (₹4,000) + industry book (₹800)',
            consequence: "Six months later, you have a new skill on your resume. You use it to deliver a project your company needed. Your manager notices. In your next review, you're in line for a senior role — ₹15,000/month higher.",
            xpDelta: 90,
            healthDelta: 15,
            walletDelta: -4800,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "The return on skill investment is the highest of any asset class for a young professional. A ₹4,800 course that leads to a ₹15,000/month raise is a 300x annual return. No index fund comes close. Your brain is your most valuable asset — it compounds too.",
            realLifeTip: "Identify the one skill that, if you developed it over the next 6 months, would most increase your market value. Focus everything there. Depth beats breadth early in a career. Platforms: Coursera, Udemy, YouTube (free), or just reading the 3 best books in your field."
          },
          {
            id: 'ld-c7',
            text: 'Put all ₹8,000 in a mutual fund',
            consequence: "₹8,000 invested at 12% annually grows to ₹8,960 in a year. Solid. But meanwhile your salary didn't change — the income gap remains. The best portfolio is your own skills and career, backed by financial investments.",
            xpDelta: 50,
            healthDelta: 5,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Index funds are excellent — after your income is growing. Early in your career, a ₹1,000 skill investment can produce ₹15,000/month more income indefinitely. A ₹1,000 investment in the Nifty 50 produces ₹120/year. Both matter — but the order matters.",
            realLifeTip: "A good financial strategy at 22–30: invest 60% of your growth energy in skills/career, 40% in financial assets. After 35, shift more to financial assets as your income ceiling rises and your time becomes more limited."
          },
          {
            id: 'ld-c8',
            text: 'Enjoy it — you earned it',
            consequence: "You spend ₹8,000 on a great weekend and experiences with friends. Real life enjoyment, genuine connection. Not a financial error — but you didn't grow your income either. The gap remains at ₹22,000.",
            xpDelta: 35,
            healthDelta: 10,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Enjoying your earnings is legitimate and healthy — that's the point of earning. But if you're working towards a specific life goal, consistent redirection of resources towards that goal is what gets you there. Balance both.",
            realLifeTip: "Build a 'fun fund' in your monthly budget — money you spend guilt-free on experiences, food, and joy. When that bucket is empty, you stop. When it's full, you enjoy freely. This structure gives you both freedom and progress."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  // BALANCE QUEST — The 50/20/30 life
  // ─────────────────────────────────────────────────────────
  {
    id: 'balanced-budget',
    title: 'The Art of the Balanced Budget',
    description: "A budget isn't a restriction — it's a plan that lets you spend guilt-free. Learn the 50/20/30 framework: half for needs, a fifth for your future, and 30% for actually living your life.",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['teen', 'senior'],
    chapterNumber: 9,
    chapter: 'Budgeting',
    estimatedMinutes: 6,
    xpReward: 200,
    startingBalance: 40000,
    steps: [
      {
        id: 'bb-1',
        title: 'What Is Money Actually For?',
        narrative: "You just got paid ₹40,000. Three people in your life give you advice:\n\n💬 Uncle: 'Save 80%, live on the rest.'\n💬 Friend: 'You're young, enjoy it all — YOLO.'\n💬 Your smarter friend: 'Make a plan that covers needs, savings, AND wants — then spend guilt-free.'\n\nWho do you listen to?",
        ageGroups: ['teen', 'senior'],
        choices: [
          {
            id: 'bb-c1',
            text: 'The smarter friend — make a plan that includes living',
            consequence: "You allocate: ₹20,000 (50%) for rent, food, bills. ₹8,000 (20%) into investments and emergency fund. ₹12,000 (30%) for dining out, travel fund, clothes, entertainment. Every rupee has a job. You spend the ₹12,000 with zero guilt because it's planned.",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'bb-2',
            isOptimal: true,
            explanation: "The 50/20/30 rule (or any variation you customise) works because it treats enjoyment as a legitimate budget category — not a failure of discipline. A plan that includes your wants is one you can actually follow for years.",
            realLifeTip: "Adjust the percentages to your life: in a high-rent city, your essentials bucket might be 60%. That's fine — just keep some allocation for both future savings and present enjoyment. Zero in either category is unsustainable."
          },
          {
            id: 'bb-c2',
            text: 'Uncle is right — save 80%, live on ₹8,000',
            consequence: "Month 1: you feel disciplined. Month 3: you're miserable and start secretly spending. Month 5: you've 'fallen off' and stopped tracking entirely. Saved total: ₹0, because extreme restriction led to rebound.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'bb-2',
            isOptimal: false,
            explanation: "80% savings on ₹40,000 means living on ₹8,000 in a city. That's not discipline — it's self-denial that backfires. Financial plans that feel like punishment rarely last beyond 90 days. Sustainable beats optimal every time.",
            realLifeTip: "The secret to long-term financial success isn't saving the most — it's building a system you can maintain for 10+ years. That system must include genuine enjoyment, or it won't survive contact with real life."
          },
          {
            id: 'bb-c3',
            text: 'Friend is right — earn it, enjoy it, figure out savings later',
            consequence: "You enjoy a great month. Month 12 arrives and you have ₹0 saved, no emergency fund, and rising anxiety. When an unexpected ₹15,000 expense hits, you go into debt.",
            xpDelta: 10,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'bb-2',
            isOptimal: false,
            explanation: "Spending everything today transfers all financial risk to your future self. YOLO has real costs: no emergency cushion means any unexpected expense becomes a crisis.",
            realLifeTip: "Even ₹2,000/month saved consistently for 10 years at 12% grows to ₹4.6 lakh. The amount is less important than the habit. Start small, start now, and automate it so it happens before you can spend it."
          }
        ]
      },
      {
        id: 'bb-2',
        title: 'The 30% Is Not Waste',
        narrative: "A colleague sees your 'wants' budget of ₹12,000 and says: 'That's irresponsible. That money should all go to savings.' You disagree. How do you explain why a fun budget is actually smart?",
        ageGroups: ['teen', 'senior'],
        choices: [
          {
            id: 'bb-c4',
            text: '"Spending on what matters to me keeps me motivated to earn more and stick to my plan."',
            consequence: "Your colleague thinks about it. You explain: a person who enjoys their financial life performs better, negotiates harder, and lasts longer than one who feels perpetually deprived. The ₹12,000 in experiences fuels the next ₹8,000 in savings.",
            xpDelta: 80,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Rest, experiences, relationships, and enjoyment aren't financial mistakes — they're what fuels the sustained effort that creates wealth. The person who burns out saving 80% achieves less than the person who saves 20% for 30 years.",
            realLifeTip: "Research shows people with a positive relationship with money — who enjoy it without guilt — make better long-term financial decisions than those who treat money as purely functional. Budget for joy. It's not indulgent; it's strategic."
          },
          {
            id: 'bb-c5',
            text: 'Maybe they\'re right — cut the fun budget further',
            consequence: "You cut to ₹5,000 for wants. Two months later you've spent ₹18,000 in one weekend — classic rebound effect. The colleague's advice, applied without nuance, made things worse.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Extreme frugality applied without a sustainable foundation creates pressure that releases in bursts. Consistent moderation always outperforms oscillating between strict and binge.",
            realLifeTip: "If you catch yourself in a spending rebound, don't shame-spiral. Reset the budget, forgive the month, and start again. The habit is what matters — not perfection."
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────
  // STARTING POINT PHILOSOPHY — YOUR JOURNEY, YOUR RULES
  // Core theme: your starting point ≠ your destination.
  // Consistency + intention beats timing + luck, every time.
  // ─────────────────────────────────────────────────────────

  {
    id: 'two-piggy-banks',
    title: 'Two Piggy Banks',
    description: "Your friend Arjun gets 3× your allowance. You both want the same ₹1,000 headset. Here's the twist — it's not about who has more. It's about what you do with what you have.",
    category: 'income',
    difficulty: 'beginner',
    ageGroups: ['junior'],
    chapterNumber: 1,
    chapter: 'Saving Basics',
    estimatedMinutes: 4,
    xpReward: 90,
    startingBalance: 200,
    steps: [
      {
        id: 'tpb-1',
        title: 'The Headset Hunt',
        narrative: "You and your best friend Arjun both want the same wireless headset — it costs ₹1,000. You get ₹200 pocket money every week. Arjun gets ₹600. Arjun laughs: \"I'll have mine in 2 weeks! You'll need 5 whole weeks.\" You feel a bit stung. What do you actually do?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'tpb-c1',
            text: '"Fine. I\'ll save ₹100 every week — half my allowance. I can do this in 10 weeks."',
            consequence: "You commit: every week, ₹100 goes straight into your savings before you touch anything else. Arjun, meanwhile, spends ₹550 of his ₹600 on games and snacks most weeks. 8 weeks later…",
            xpDelta: 80,
            healthDelta: 15,
            walletDelta: 100,
            nextStepId: 'tpb-2a',
            isOptimal: true,
            explanation: "Saving 50% of what you have beats spending 90% of something bigger. It doesn't matter how much you start with — it matters what percentage you keep.",
            realLifeTip: "Never compare your income to someone else's. Compare your savings RATE. Someone saving 20% of ₹200 will outrun someone saving 5% of ₹600 every single time."
          },
          {
            id: 'tpb-c2',
            text: '"It\'s not fair. I\'ll just wait until I get more pocket money someday."',
            consequence: "Three months later you still have ₹200/week, still haven't saved for the headset, and Arjun has already bought AND broken his. Meanwhile you have ₹0 saved and the headset is now ₹1,200. The wait didn't help.",
            xpDelta: 15,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'tpb-2b',
            isOptimal: false,
            explanation: "Waiting for a 'better starting point' is the most expensive mistake you can make. Every week you wait is a week you didn't save. Your starting point doesn't need to be perfect to begin.",
            realLifeTip: "The only bad time to start saving is next week. Your starting amount doesn't matter — your starting habit does."
          }
        ]
      },
      {
        id: 'tpb-2a',
        title: 'The 8-Week Reveal',
        narrative: "8 weeks in. You've saved ₹100 every single week = ₹800 saved. You're close! Then you check on Arjun. He saved maybe ₹50 some weeks when he felt like it. He has ₹350 total — less than you, even though his weekly allowance is 3× yours. He's shocked. What do you say?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'tpb-c3',
            text: '"The amount you get doesn\'t matter. It\'s the amount you save that counts."',
            consequence: "Arjun actually listens. He agrees to save ₹300/week from now on (50% of his ₹600). Two weeks later you both have the headset — you for ₹1,000 at week 10, Arjun slightly later. You both win, because you both picked a savings HABIT.",
            xpDelta: 90,
            healthDelta: 20,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You just discovered the single most important money idea: your savings rate (% of income saved) determines your outcome — not your income level. Arjun had 3× your income and saved LESS. You saved MORE by being consistent with a percentage.",
            realLifeTip: "The richest people in the world got there by saving a high PERCENTAGE — not by earning a big number. Saving 50% of ₹200 is literally better than saving 5% of ₹1,000. Start your percentage habit today."
          },
          {
            id: 'tpb-c4',
            text: '"Ha! I beat him. I should ask for more pocket money now."',
            consequence: "You get the headset and feel proud — but you miss the bigger lesson. Your parents don't increase your allowance, and you go back to spending everything. 3 months later, you\'re back to ₹0 savings because you thought the win was about luck, not habit.",
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -1000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "You won this round, but you didn't notice WHY. It wasn't the amount you saved (₹100/week) — it was the CONSISTENCY. Without that insight, the habit disappears after the goal is reached.",
            realLifeTip: "Every financial win teaches you something. Ask 'WHY did this work?' — not just 'what can I spend now?'"
          }
        ]
      },
      {
        id: 'tpb-2b',
        title: 'The Cost of Waiting',
        narrative: "Three months have passed. The headset now costs ₹1,200 (prices went up). You still have ₹200/week and ₹0 saved. Arjun already bought his — and broke it. Your cousin visits and asks why you don't have headphones yet. How do you answer?",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'tpb-c5',
            text: '"I was waiting for the right time. Starting now — ₹100/week, no matter what."',
            consequence: "Late start, but a real start. You save ₹100/week for 12 weeks and buy the headset for ₹1,200. You could have had it 8 weeks earlier — but starting now beats continuing to wait. You\'ve learned the most important lesson without anyone telling you.",
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Starting late is still infinitely better than not starting. The 3 months you waited cost you some time — but 'starting now' will always be the right answer. You can never go back and start earlier, but you CAN start today.",
            realLifeTip: "The best time to start saving was 3 months ago. The second best time is right now. Don't let guilt about waiting stop you from starting."
          },
          {
            id: 'tpb-c6',
            text: '"I\'ll wait a bit longer — maybe I\'ll get a bigger allowance soon."',
            consequence: "6 more months pass. No bigger allowance. Headset is now ₹1,400. You\'ve spent 9 months with ₹0 saved and the goal is further away than when you started. Waiting made it harder, not easier.",
            xpDelta: 5,
            healthDelta: -8,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Every month you wait, two things happen: the goal gets more expensive, and you lose another month of savings. Waiting for better conditions is the most expensive choice you can make.",
            realLifeTip: "Your circumstances might improve — but they might not. Build the habit with what you have now, so you're ready either way."
          }
        ]
      }
    ]
  },

  {
    id: 'raise-trap',
    title: 'The Raise Trap',
    description: "Your tutoring income just jumped from ₹1,500 to ₹2,500 a month. Everyone's celebrating. But this moment — right here — is where most people quietly give up their financial future without realising it.",
    category: 'income',
    difficulty: 'intermediate',
    ageGroups: ['teen'],
    chapterNumber: 6,
    chapter: 'Social & Spending',
    estimatedMinutes: 5,
    xpReward: 110,
    startingBalance: 2500,
    steps: [
      {
        id: 'rt-1',
        title: 'The Extra ₹1,000',
        narrative: "Your tutoring clients increased. You now earn ₹2,500/month instead of ₹1,500. Your current expenses: phone (₹350), snacks/hangouts (₹400), transport (₹250) = ₹1,000 total. So you were already saving ₹500/month before the raise. Now you have a new ₹1,000 sitting there. Your friends are suggesting ways to spend it. What do you do?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'rt-c1',
            text: 'Upgrade: better phone plan (₹500 extra), eat out more (₹400 extra). I earned this.',
            consequence: "Fair feeling. But your new monthly spend is ₹1,900. You save only ₹600/month — just ₹100 more than before the raise, even though your income rose by ₹1,000. In 6 months, you have ₹3,600 saved. Meanwhile…",
            xpDelta: 30,
            healthDelta: 0,
            walletDelta: -900,
            nextStepId: 'rt-2b',
            isOptimal: false,
            explanation: "Lifestyle inflation: when your spending rises to match your income, your savings stay flat. A raise feels like a reward — and spending it all feels deserved. But it's actually a trap that keeps your savings growth locked in place.",
            realLifeTip: "Every raise is a fork in the road. One path: spend the extra. Other path: invest the extra and keep spending the same. The second path compounds over decades."
          },
          {
            id: 'rt-c2',
            text: 'Keep my exact same lifestyle. Invest the whole ₹1,000 extra every month.',
            consequence: "Your daily life doesn't change at all — same phone plan, same hangouts. But your savings jump from ₹500/month to ₹1,500/month. In 6 months you've saved ₹9,000. In a year: ₹18,000. That's almost a month's salary in savings — before you even turn 18.",
            xpDelta: 110,
            healthDelta: 20,
            walletDelta: 1000,
            nextStepId: 'rt-2a',
            isOptimal: true,
            explanation: "This is the most powerful financial move most people never make: keeping your lifestyle STABLE when your income rises. You don't need to sacrifice — your old lifestyle was already working. The new money just goes straight to your future.",
            realLifeTip: "The raise doesn't have to change your daily life at all. If your current lifestyle is comfortable, you don't NEED to upgrade it just because you can."
          }
        ]
      },
      {
        id: 'rt-2a',
        title: 'The 6-Month Snapshot',
        narrative: "Six months in. You've saved ₹9,000 — triple what you would have with the old income + old habits. Your friend Riya got the same raise but upgraded everything. She has ₹3,200 saved. Same starting point, same raise, completely different outcome. She now wants to invest but has nothing left. What advice do you give her?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'rt-c3',
            text: '"Start now — even ₹200/month. Don\'t wait to have the \'right amount\'."',
            consequence: "Riya starts with ₹200/month. It feels small, but she's building the habit. In a year she has ₹2,400 saved and the habit is locked in. She gradually increases as her income grows. She started late — but she started. That's what matters.",
            xpDelta: 90,
            healthDelta: 15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "The advice you give Riya is the most important thing in personal finance: start with whatever you have, start now, and increase over time. ₹200 now + the habit is worth more than ₹2,000 later without the habit.",
            realLifeTip: "Any amount saved consistently is better than a large amount saved sporadically. The habit is the asset, not the number."
          },
          {
            id: 'rt-c4',
            text: '"You should have saved from day one. Now you need to save ₹1,000/month to catch up."',
            consequence: "The advice is harsh and unrealistic — Riya\'s lifestyle is now built around her full ₹2,500. Cutting ₹1,000 out overnight causes stress, and she gives up after 3 weeks. The guilt of starting late stopped her from starting at all.",
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Guilt-based advice rarely works. Telling someone they should have started sooner doesn't help them start now. The most useful financial advice meets people where they are — not where they should have been.",
            realLifeTip: "When helping friends with money, lead with 'here's what you can do starting today' — never 'here's what you should have done.' The past is fixed. The next decision isn't."
          }
        ]
      },
      {
        id: 'rt-2b',
        title: 'The Reality Check',
        narrative: "Six months in. Your income is ₹2,500 but you only saved ₹3,600 (₹600/month). Your friend who got the same raise but kept their old lifestyle saved ₹9,000. You both started from the same place. The difference? You upgraded your lifestyle, they upgraded their savings. How do you feel about this?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'rt-c5',
            text: '"From this month: same income, no more upgrades. Every extra rupee goes to savings."',
            consequence: "You downgrade to your original phone plan and cut the extra dining. It stings for a week. But within 3 months, you've recovered and are saving ₹1,500/month like your friend. Starting late here cost you ₹5,400 in savings — but you corrected course. That matters more.",
            xpDelta: 80,
            healthDelta: 10,
            walletDelta: 600,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Correcting course is always worth it. You lost 6 months, but you didn't lose the habit. The willingness to reset — without guilt — is what separates people who build wealth from those who don't.",
            realLifeTip: "If you realise you've let lifestyle inflation in, don't spiral. Quietly reverse it, start saving the difference, and don't look back. One correction now is worth 10 years of better compounding."
          },
          {
            id: 'rt-c6',
            text: '"₹3,600 is still a lot. I\'ll work harder next month to save more."',
            consequence: "Next month, your 'work harder' plan doesn't kick in because your expenses are now habits. You save ₹600 again. And the month after. The upgraded lifestyle has become your new baseline, and 'next month I'll save more' turns into a phrase you say for years without it ever happening.",
            xpDelta: 15,
            healthDelta: -5,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Lifestyle inflation is self-reinforcing — once you're used to the better phone plan and nicer lunches, they feel like needs, not upgrades. The solution isn't willpower. It's structural: change the system, not just the intention.",
            realLifeTip: "Don't rely on willpower to save more next month. Set up an automatic transfer to savings on the day income arrives. Make saving the default, not the intention."
          }
        ]
      }
    ]
  },

  {
    id: 'right-on-time',
    title: 'Right On Time',
    description: "Rohan started tracking his money at 14. You're starting at 16 or 17 and you feel behind. Here's what actually happens when you compare 'perfect timing' to 'consistent intention' — the result might surprise you.",
    category: 'investing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    chapterNumber: 18,
    chapter: 'Investing',
    estimatedMinutes: 6,
    xpReward: 130,
    startingBalance: 500,
    steps: [
      {
        id: 'rot-1',
        title: 'The Comparison Trap',
        narrative: "Rohan mentions in class that he started saving at 14. He has ₹8,000 saved. You're 17, you've only just started thinking about money, and you have ₹500. Your immediate instinct is: \"I'm already behind.\" You feel a knot in your stomach. What do you actually do with that feeling?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'rot-c1',
            text: '"I\'m too late. There\'s no point starting with just ₹500 when Rohan already has ₹8,000."',
            consequence: "You decide to wait until you 'have more to invest with.' Six months pass. Rohan now has ₹11,000 because he kept going. You have ₹500 — the same ₹500 from 6 months ago. The gap grew because you paused, not because you started late.",
            xpDelta: 10,
            healthDelta: -10,
            walletDelta: 0,
            nextStepId: 'rot-2b',
            isOptimal: false,
            explanation: "Comparing your Chapter 1 to someone else's Chapter 3 is the most common reason people never start. You're not competing with Rohan. You're building your own trajectory — and it starts with ₹500, not ₹8,000.",
            realLifeTip: "Someone else's head start doesn't reduce your potential. It just means your story starts a few chapters later. That's fine — all the best stories have a protagonist who starts behind."
          },
          {
            id: 'rot-c2',
            text: '"₹500 is my starting point. I\'ll save ₹600/month from here. My journey starts today."',
            consequence: "You set up a recurring ₹600/month savings commitment. In 12 months, you have ₹7,700 (₹500 + ₹7,200 saved). Rohan has ₹14,000 — but here's the thing: you're 18, you both have years ahead of you, and your SAVINGS RATE is actually higher than his. The gap is shrinking, not growing.",
            xpDelta: 110,
            healthDelta: 25,
            walletDelta: 600,
            nextStepId: 'rot-2a',
            isOptimal: true,
            explanation: "Starting with less than someone else just means your early numbers are smaller — not your potential. If your savings rate is higher than theirs, you will eventually overtake them regardless of the head start. Consistency competes with timing every time, and consistency wins long-term.",
            realLifeTip: "Your starting point is just that — a starting point. What matters infinitely more is what you do consistently from here. Pick a savings percentage (even 20%), start it today, and don't touch it."
          }
        ]
      },
      {
        id: 'rot-2a',
        title: 'The Intentional Upgrade',
        narrative: "A year in, you have ₹7,700 saved. You've been consistent at ₹600/month. Now your income from part-time work grew — you earn ₹3,500/month instead of ₹2,500. You have a choice about what to do with the extra ₹1,000. Rohan just spent his raise on a new gaming setup. What's your move?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'rot-c3',
            text: 'Increase my savings to ₹1,400/month. Keep the same lifestyle. Accelerate.',
            consequence: "Your savings go from ₹600/month to ₹1,400/month. In the next 12 months you add ₹16,800. Total at age 19: ₹24,500. Rohan, who spent his raise, has ₹16,000. You've overtaken him — not because you started earlier, but because you were more intentional when it mattered.",
            xpDelta: 130,
            healthDelta: 25,
            walletDelta: 1400,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "This is the 'starting late' advantage nobody talks about: when you start a little behind, you develop intentionality. You can't coast. You have to be deliberate — and deliberate investors outperform casual investors almost every time.",
            realLifeTip: "Every time your income rises, resist the lifestyle upgrade for 3 months. In those 3 months, increase your savings percentage first. Lifestyle can rise slowly — your savings rate should rise fast."
          },
          {
            id: 'rot-c4',
            text: 'Treat myself — I\'ve been consistent for a year. New phone (₹8,000), keep saving ₹600/month.',
            consequence: "You spend ₹8,000 on a phone, wiping out most of a year's savings. You're back to ₹700 in savings. You feel good for a month, then you feel the setback. Your savings rate stays at ₹600/month because the lifestyle upgrade felt earned.",
            xpDelta: 40,
            healthDelta: 0,
            walletDelta: -8000,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "You had the right instinct (stay consistent) but the wrong reward structure (a single large purchase that wiped out progress). Treats are fine — but they should come from a separate 'want fund', not from your savings. The savings are untouchable.",
            realLifeTip: "Build a 'fun fund' — a separate small pot for big treats. This protects your savings from yourself. When the fun fund is full, you can spend it guilt-free. When it's empty, you wait. Savings stay separate."
          }
        ]
      },
      {
        id: 'rot-2b',
        title: 'The Restart',
        narrative: "Six months have passed. You still have ₹500, haven't saved anything. Rohan has ₹11,000. The gap feels even bigger now, and you feel worse. Your school runs a financial literacy workshop and the speaker says: \"The best financial plan isn't the one that started earliest. It's the one you can stick to for the next 20 years.\" Something shifts. What do you do?",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'rot-c5',
            text: 'Start today. ₹500/month, automatic transfer, every month without fail.',
            consequence: "You set it up that afternoon. ₹500/month, automatic. No willpower needed. In 12 months: ₹6,500. In 24 months: ₹12,500. At 20 years old, you have ₹12,500 and a savings habit that will run for decades. Rohan has ₹20,000 — but his inconsistency is already showing. The gap is narrowing.",
            xpDelta: 100,
            healthDelta: 20,
            walletDelta: 500,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "You lost 6 months. But you found the most important insight: start now, automate it, and stop feeling guilty about the delay. The guilt was costing you more than the delay. Starting today with ₹500/month beats waiting another year for ₹1,000/month every single time.",
            realLifeTip: "Automate your savings. Set up a transfer for the day after income arrives. Remove the decision entirely. The most important financial habit is one you don't have to think about."
          },
          {
            id: 'rot-c6',
            text: '"I\'ll start properly when I get a job and earn real money. This is just practice money."',
            consequence: "At 22, you get your first salary. But you haven't built the habit. So you spend most of your salary the same way you spent your pocket money — instinctively, without a plan. The 'real money' arrives, and the 'real savings' somehow never do.",
            xpDelta: 5,
            healthDelta: -15,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Habits built with small money are the exact same habits that run with big money. If you can't save 20% of ₹500, you won't magically save 20% of ₹50,000. The muscle is built through repetition — amount is secondary.",
            realLifeTip: "There is no such thing as 'practice money.' The habits you build with ₹200/month are the same habits that will handle ₹20,000/month. Start building the muscle now."
          }
        ]
      }
    ]
  }

];
