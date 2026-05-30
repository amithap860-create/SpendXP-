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
    description: "You just got ₹500 as a birthday gift! Friends want ice cream and a toy shop is calling your name. What do you do?",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['junior'],
    estimatedMinutes: 3,
    xpReward: 80,
    startingBalance: 500,
    steps: [
      {
        id: 'bl-1',
        title: 'Ice Cream Time!',
        narrative: "Your 4 friends shout: 'Birthday treat! Buy us ice cream!' That will cost ₹160 total. You have ₹500 and really want a ₹350 toy.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c1',
            text: 'Buy ice cream for everyone (₹160)',
            consequence: "Everyone's happy! You have ₹340 left. The toy costs ₹350. You're ₹10 short!",
            xpDelta: 25,
            healthDelta: 5,
            walletDelta: -160,
            nextStepId: 'bl-2a',
            isOptimal: false,
            explanation: "Treating friends is kind, but spending before checking if you can still reach your goal can leave you short.",
            realLifeTip: "Before spending, always ask: 'Will I still have enough for what I really want?'"
          },
          {
            id: 'bl-c2',
            text: 'Buy only your own ice cream (₹40)',
            consequence: "You enjoy your treat! You have ₹460 left — more than enough for the toy.",
            xpDelta: 40,
            healthDelta: 8,
            walletDelta: -40,
            nextStepId: 'bl-2b',
            isOptimal: true,
            explanation: "It's okay to enjoy something for yourself. You can be kind and still reach your goals.",
            realLifeTip: "You don't have to pay for everyone every time. Real friends understand."
          },
          {
            id: 'bl-c3',
            text: 'Buy your ice cream, put the rest away',
            consequence: "You enjoy a ₹40 treat, save ₹460, and can easily buy the ₹350 toy AND still have ₹110 left. Best of all three options!",
            xpDelta: 55,
            healthDelta: 12,
            walletDelta: -40,
            nextStepId: 'bl-2b',
            isOptimal: true,
            explanation: "Balance means enjoying the moment AND being smart with the rest. You don't have to choose between fun and good decisions — you can have both when you plan.",
            realLifeTip: "The goal isn't to save every single rupee — it's to enjoy life while keeping your future self happy. A small treat today doesn't hurt. A big, unplanned splurge does."
          }
        ]
      },
      {
        id: 'bl-2a',
        title: 'So Close!',
        narrative: "You have ₹340 and the toy is ₹350. You are ₹10 short. Your little sibling offers to lend you ₹10.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c4',
            text: 'Borrow ₹10 and buy the toy',
            consequence: "You got the toy! But now you owe your sibling ₹10. Remember to pay it back.",
            xpDelta: 20,
            healthDelta: 3,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Borrowing is okay for small amounts, but always remember to pay it back. Your reputation matters.",
            realLifeTip: "If you borrow, pay back as soon as you can. It builds trust."
          },
          {
            id: 'bl-c5',
            text: 'Wait and save ₹10 more from next pocket money',
            consequence: "You wait one week. Next pocket money arrives and you buy the toy with your own money — no debt!",
            xpDelta: 55,
            healthDelta: 12,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Waiting a little is much better than owing someone money.",
            realLifeTip: "Patience is a superpower with money."
          }
        ]
      },
      {
        id: 'bl-2b',
        title: 'Toy Shop Decision',
        narrative: "You have enough for the ₹350 toy! But you also notice a ₹500 deluxe version. The shop says it goes on sale next month for ₹350.",
        ageGroups: ['junior'],
        choices: [
          {
            id: 'bl-c6',
            text: 'Buy the ₹350 toy now',
            consequence: "You got the toy and still have money left. Happy days!",
            xpDelta: 40,
            healthDelta: 8,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Getting what you planned for and staying within budget is a win.",
            realLifeTip: "Stick to your plan — impulse upgrades are sneaky!"
          },
          {
            id: 'bl-c7',
            text: 'Wait for the deluxe version to go on sale',
            consequence: "Wow — you wait one month and get the ₹500 toy for ₹350! Patience = better stuff for same price.",
            xpDelta: 65,
            healthDelta: 12,
            walletDelta: -350,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Patience + timing = more value for your money. Brilliant!",
            realLifeTip: "Sales are real. Waiting for the right moment can get you more."
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
    description: "The squad wants to order pizza — ₹450 each. Your monthly allowance is ₹1,500 and you have already spent ₹800 this month. What do you do?",
    category: 'lifestyle',
    difficulty: 'beginner',
    ageGroups: ['teen'],
    estimatedMinutes: 5,
    xpReward: 160,
    startingBalance: 700,
    steps: [
      {
        id: 'gcd-1',
        title: 'Friday Night Pizza',
        narrative: "Group chat explodes: 'Pizza Friday! ₹450 each at that new place.' You have ₹700 left this month. Your friend's birthday is next week and you need ₹300 for a gift.",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c1',
            text: 'Join in for the full pizza (₹450)',
            consequence: "Fun night! But you have only ₹250 left — not enough for the birthday gift.",
            xpDelta: 15,
            healthDelta: -8,
            walletDelta: -450,
            nextStepId: 'gcd-2a',
            isOptimal: false,
            explanation: "Peer pressure spending often leads to regret when you miss the things that actually matter.",
            realLifeTip: "Before any social spend, ask: 'What am I giving up to do this?'"
          },
          {
            id: 'gcd-c2',
            text: "Suggest a cheaper place — ₹200 each",
            consequence: "Two friends agree! You eat well, spend ₹200, and still have ₹500 for the gift and some left over.",
            xpDelta: 65,
            healthDelta: 10,
            walletDelta: -200,
            nextStepId: 'gcd-2b',
            isOptimal: true,
            explanation: "Suggesting alternatives shows leadership and keeps your budget healthy.",
            realLifeTip: "You don't have to say no — just offer a smarter option."
          },
          {
            id: 'gcd-c3',
            text: 'Skip the pizza, eat at home',
            consequence: "You save ₹450. You have ₹700 for the gift and some extra. Your real friends understand.",
            xpDelta: 50,
            healthDelta: 8,
            walletDelta: 0,
            nextStepId: 'gcd-2b',
            isOptimal: true,
            explanation: "Skipping once to protect a priority is a mature financial decision.",
            realLifeTip: "FOMO (Fear Of Missing Out) is the most expensive feeling a teenager can have."
          }
        ]
      },
      {
        id: 'gcd-2a',
        title: 'Birthday Gift Crisis',
        narrative: "You have ₹250. The gift you planned costs ₹300. You are ₹50 short. Your options are limited.",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c4',
            text: 'Give a heartfelt homemade gift instead',
            consequence: "Your friend loved the personal gift more than anything from a shop. Zero spent, maximum love.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Creativity solves money problems — and often creates better outcomes.",
            realLifeTip: "The most memorable gifts are personal, not expensive."
          },
          {
            id: 'gcd-c5',
            text: 'Buy a ₹200 gift instead',
            consequence: "You find something nice for ₹200. Your friend is happy. You have ₹50 left as a tiny buffer.",
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -200,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Adjusting your plan based on reality is a good skill to have.",
            realLifeTip: "A budget isn't a failure — it's a decision tool."
          },
          {
            id: 'gcd-c6',
            text: 'Borrow ₹50 from a family member',
            consequence: "Gift given! But you owe ₹50. Make sure you pay it back first thing next month.",
            xpDelta: 20,
            healthDelta: -2,
            walletDelta: 50,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Small loans from family are fine in emergencies — but always pay back.",
            realLifeTip: "Owing money, even to family, creates stress. Avoid it whenever you can."
          }
        ]
      },
      {
        id: 'gcd-2b',
        title: 'Money Left Over',
        narrative: "You handled the pizza situation smartly and still have ₹300–₹500 left this month. What do you do with the extra?",
        ageGroups: ['teen'],
        choices: [
          {
            id: 'gcd-c7',
            text: 'Save it for next month',
            consequence: "Next month starts with a buffer! That means no stress from the first day. This is how adults build stability.",
            xpDelta: 70,
            healthDelta: 12,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Rolling savings forward creates a growing cushion. This is how wealth starts.",
            realLifeTip: "Start next month ahead, not at zero."
          },
          {
            id: 'gcd-c8',
            text: 'Spend it on something fun',
            consequence: "Great fun! And that is okay — you earned it by making smart choices earlier. Balance is real.",
            xpDelta: 40,
            healthDelta: 6,
            walletDelta: -300,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Reward yourself sometimes — but only after you have covered your priorities.",
            realLifeTip: "Saving first, spending the remainder is the golden formula."
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
            text: 'Book a ₹6,000 trip with friends now',
            consequence: 'Trip booked! But you still owe ₹12,200 in bills. Only ₹16,800 remains for food and travel.',
            xpDelta: 20,
            healthDelta: -5,
            walletDelta: -6000,
            nextStepId: 'fp-2-tight',
            isOptimal: false,
            explanation: "Impulse spending on lifestyle before bills is the #1 cause of month-end debt.",
            realLifeTip: "Use a 'Sinking Fund' for trips. Save ₹1,500/month for 4 months instead of one big hit."
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
    title: 'Renting in Mumbai: The BKC Choice',
    description: 'You got a job in BKC (₹55,000/month). Mumbai is expensive. Can you find a home without going broke?',
    category: 'housing',
    difficulty: 'advanced',
    ageGroups: ['senior'],
    estimatedMinutes: 10,
    xpReward: 350,
    startingBalance: 90000,
    steps: [
      {
        id: 'ra-1',
        title: 'Choosing Where to Live',
        narrative: "BKC is your office. You have ₹90,000 in savings. Renting here is high-stakes.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c1',
            text: 'PG in BKC (Walking): ₹18,000',
            consequence: 'High rent, but ₹0 commute and meals included. Deposit: ₹18,000.',
            xpDelta: 40,
            healthDelta: 5,
            walletDelta: -18000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "Good for time management, but eats 33% of salary. Balanced for a first job.",
            realLifeTip: "Commute time is money. Living close can save you 100+ hours of travel a month."
          },
          {
            id: 'ra-c2',
            text: 'Shared 1BHK in Andheri: ₹12,500',
            consequence: 'Low rent (23% of salary). Deposit: ₹37,500. 45 min commute.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: -37500,
            nextStepId: 'ra-2',
            isOptimal: true,
            explanation: "Housing under 25% of salary is the gold standard for wealth building in India.",
            realLifeTip: "Use the 3:1 income-to-rent ratio rule."
          },
          {
            id: 'ra-c3',
            text: 'Self 1BHK in Ghatkopar: ₹22,000',
            consequence: 'Your own space, but 40% of salary. Deposit: ₹66,000. Commute extra.',
            xpDelta: 20,
            healthDelta: -8,
            walletDelta: -66000,
            nextStepId: 'ra-2',
            isOptimal: false,
            explanation: "40% on rent is a 'House Poor' trap. Your savings will never grow.",
            realLifeTip: "Mumbai deposits are high. Plan for 3-6 months' rent upfront."
          }
        ]
      },
      {
        id: 'ra-2',
        title: 'The Broker Problem',
        narrative: "The broker wants 1 month rent as brokerage. This is on top of your deposit.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c4',
            text: 'Negotiate brokerage to 50%',
            consequence: 'Success! You save ₹6,250 - ₹11,000. Most people never ask.',
            xpDelta: 55,
            healthDelta: 8,
            walletDelta: -6250,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Brokerage is negotiable. A 30-minute talk saved you 10 days of work.",
            realLifeTip: "Brokers are more willing to negotiate if you can sign and pay today."
          },
          {
            id: 'ra-c5',
            text: 'Use NoBroker.in (₹0 fees)',
            consequence: 'Saves ₹12,500 - ₹22,000 but takes 2 weeks longer to find a place.',
            xpDelta: 60,
            healthDelta: 10,
            walletDelta: 0,
            nextStepId: 'ra-3',
            isOptimal: true,
            explanation: "Avoid unnecessary middleman fees whenever possible to preserve your capital.",
            realLifeTip: "Direct owner listings are rare but high-value."
          },
          {
            id: 'ra-c6',
            text: 'Pay full to secure flat',
            consequence: 'Flat secured! But your savings are now dangerously low. No buffer left.',
            xpDelta: 15,
            healthDelta: -4,
            walletDelta: -12500,
            nextStepId: 'ra-3',
            isOptimal: false,
            explanation: "Accepting high upfront costs without pushback drains your liquidity.",
            realLifeTip: "Always have a 'Move-in Fund' separate from your security deposit."
          }
        ]
      },
      {
        id: 'ra-3',
        title: 'The Lease Trap',
        narrative: "Clause 7 says: rent increases 10% on renewal. Clause 12: tenant pays for all repairs under ₹5,000.",
        ageGroups: ['senior'],
        choices: [
          {
            id: 'ra-c7',
            text: 'Negotiate Clause 12 to ₹2,000',
            consequence: 'Saves you ₹3,000 per repair event. Landlord agreed to 5% cap on hike too.',
            xpDelta: 70,
            healthDelta: 9,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: true,
            explanation: "Leases are living documents. Negotiating terms now saves thousands later.",
            realLifeTip: "Landlords often put aggressive clauses just to see if you'll sign."
          },
          {
            id: 'ra-c8',
            text: 'Sign without reading fully',
            consequence: "Month 3: pipe bursts. Repair cost ₹3,200. Clause 12 means you pay it. Month 11: Rent jumps ₹2,200.",
            xpDelta: 5,
            healthDelta: -8,
            walletDelta: -3200,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Ignorance of contract terms is a recurring cost in personal finance.",
            realLifeTip: "The 11-month lease is standard in India to avoid high stamp duty registration."
          },
          {
            id: 'ra-c9',
            text: 'Accept terms as written',
            consequence: "You have the place, but you've accepted high maintenance risk and high future costs.",
            xpDelta: 25,
            healthDelta: 2,
            walletDelta: 0,
            nextStepId: 'end',
            isOptimal: false,
            explanation: "Failing to push back on boilerplate terms leaves money on the table.",
            realLifeTip: "Normal wear and tear should always be the owner's responsibility."
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
  }
];
