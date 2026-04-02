export const CURRICULUM_MAP = {
  'fdic-young-people': {
    relatedGames: ['budgetBlitz', 'finIQQuiz'],
    relatedQuests: ['first-paycheck', 'emergency-expense'],
    relatedLessons: ['budgeting', 'saving'],
    ageGroups: ['junior', 'teen'],
    topics: ['Banking', 'Saving', 'Budgeting', 'Spending']
  },
  'fdic-young-adults': {
    relatedGames: ['creditScoreBuilder', 'stockMarketSim'],
    relatedQuests: ['first-credit-card', 'first-apartment'],
    relatedLessons: ['credit', 'investing'],
    ageGroups: ['teen', 'senior'],
    topics: ['Credit', 'Products', 'Real-world skills']
  },
  'cfpb-youth-education': {
    relatedGames: ['finIQQuiz'],
    relatedQuests: ['calculations-quest'],
    relatedLessons: ['budgeting', 'saving', 'investing'],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Curriculum', 'Age-based learning', 'Structure']
  },
  'cfpb-building-blocks-teach': {
    relatedGames: ['budgetBlitz', 'moneyMaze'],
    relatedQuests: ['vacation-planning', 'phone-emi'],
    relatedLessons: ['spending', 'credit'],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Activities', 'Missions', 'Skills']
  },
  'cfpb-building-blocks-learn': {
    relatedGames: ['compoundClicker'],
    relatedQuests: ['first-paycheck'],
    relatedLessons: ['saving', 'investing'],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Progression', 'Capability', 'Growth']
  },
  'khan-personal-finance': {
    relatedGames: ['finIQQuiz', 'budgetBlitz'],
    relatedQuests: ['first-paycheck', 'emergency-expense'],
    relatedLessons: ['budgeting', 'saving', 'credit'],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Budgeting', 'Saving', 'Debt', 'Insurance']
  },
  'khan-saving-budgeting': {
    relatedGames: ['budgetBlitz', 'compoundClicker'],
    relatedQuests: ['vacation-planning'],
    relatedLessons: ['budgeting', 'saving'],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Budgeting', 'Saving habits', 'Goals']
  },
  'oecd-framework-overview': {
    relatedGames: ['finIQQuiz', 'stockMarketSim'],
    relatedQuests: ['calculations-quest'],
    relatedLessons: ['investing', 'taxes'],
    ageGroups: ['teen', 'senior'],
    topics: ['Money', 'Planning', 'Risk', 'Landscape']
  },
  'oecd-full-framework': {
    relatedGames: ['creditScoreBuilder', 'moneyMaze'],
    relatedQuests: ['first-credit-card', 'first-apartment'],
    relatedLessons: ['credit', 'taxes', 'investing'],
    ageGroups: ['senior'],
    topics: ['Competency map', 'Full curriculum']
  },
  'cfpb-curriculum-review': {
    relatedGames: [],
    relatedQuests: [],
    relatedLessons: [],
    ageGroups: ['junior', 'teen', 'senior'],
    topics: ['Quality', 'Evaluation', 'Effectiveness']
  },
} as const;

export type FrameworkId = keyof typeof CURRICULUM_MAP;

export interface FrameworkData {
  id: FrameworkId;
  name: string;
  source: 'FDIC' | 'CFPB' | 'Khan Academy' | 'OECD';
  description: string;
  ageRange: string;
  difficulty: 1 | 2 | 3;
  topics: string[];
  interactiveType: 'quiz' | 'skills' | 'timeline' | 'missions' | 'progression' | 'explorer' | 'budget' | 'domains' | 'competency' | 'rating';
}

export const FRAMEWORKS: FrameworkData[] = [
  {
    id: 'fdic-young-people',
    name: 'Money Smart for Young People',
    source: 'FDIC',
    description: 'Banking basics, saving, spending, and budgeting lessons designed for young learners.',
    ageRange: 'Ages 8-18',
    difficulty: 1,
    topics: ['Banking', 'Saving', 'Budgeting', 'Spending'],
    interactiveType: 'quiz'
  },
  {
    id: 'fdic-young-adults',
    name: 'Money Smart for Young Adults',
    source: 'FDIC',
    description: 'Practical teen topics including financial products and real-world money skills.',
    ageRange: 'Teens+',
    difficulty: 2,
    topics: ['Credit', 'Products', 'Real-world skills'],
    interactiveType: 'skills'
  },
  {
    id: 'cfpb-youth-education',
    name: 'Youth Financial Education',
    source: 'CFPB',
    description: 'Curriculum structure showing what to learn at each age stage.',
    ageRange: 'All ages',
    difficulty: 2,
    topics: ['Curriculum', 'Age-based learning', 'Structure'],
    interactiveType: 'timeline'
  },
  {
    id: 'cfpb-building-blocks-teach',
    name: 'Teach the Building Blocks',
    source: 'CFPB',
    description: 'Lesson ideas, activities, and skill-building exercises for financial education.',
    ageRange: 'All ages',
    difficulty: 2,
    topics: ['Activities', 'Missions', 'Skills'],
    interactiveType: 'missions'
  },
  {
    id: 'cfpb-building-blocks-learn',
    name: 'Learn About the Building Blocks',
    source: 'CFPB',
    description: 'How financial capability develops over time with progression systems.',
    ageRange: 'All ages',
    difficulty: 2,
    topics: ['Progression', 'Capability', 'Growth'],
    interactiveType: 'progression'
  },
  {
    id: 'khan-personal-finance',
    name: 'Personal Finance',
    source: 'Khan Academy',
    description: 'Simple explanations of budgeting, saving, debt, insurance, and everyday money decisions.',
    ageRange: 'All ages',
    difficulty: 1,
    topics: ['Budgeting', 'Saving', 'Debt', 'Insurance'],
    interactiveType: 'explorer'
  },
  {
    id: 'khan-saving-budgeting',
    name: 'Saving and Budgeting',
    source: 'Khan Academy',
    description: 'Budgeting mechanics, money planning, saving habits, and real-world scenarios.',
    ageRange: 'All ages',
    difficulty: 2,
    topics: ['Budgeting', 'Saving habits', 'Goals'],
    interactiveType: 'budget'
  },
  {
    id: 'oecd-framework-overview',
    name: 'Financial Competence Framework',
    source: 'OECD',
    description: 'Overall framework covering money, transactions, planning, risks, and financial landscape.',
    ageRange: 'Teens+',
    difficulty: 3,
    topics: ['Money', 'Planning', 'Risk', 'Landscape'],
    interactiveType: 'domains'
  },
  {
    id: 'oecd-full-framework',
    name: 'Full Framework Curriculum',
    source: 'OECD',
    description: 'Complete curriculum design with competency mapping and age-based content structure.',
    ageRange: 'Ages 17-20',
    difficulty: 3,
    topics: ['Competency map', 'Full curriculum'],
    interactiveType: 'competency'
  },
  {
    id: 'cfpb-curriculum-review',
    name: 'Curriculum Review Tool',
    source: 'CFPB',
    description: 'Evaluating and comparing financial literacy materials by content, quality, and effectiveness.',
    ageRange: 'All ages',
    difficulty: 2,
    topics: ['Quality', 'Evaluation', 'Effectiveness'],
    interactiveType: 'rating'
  }
];

export const SOURCE_COLORS = {
  'FDIC': 'bg-teal-100 text-teal-800 border-teal-200',
  'CFPB': 'bg-blue-100 text-blue-800 border-blue-200',
  'Khan Academy': 'bg-amber-100 text-amber-800 border-amber-200',
  'OECD': 'bg-purple-100 text-purple-800 border-purple-200'
} as const;

export const getAgeGroupIncome = (ageGroup: 'junior' | 'teen' | 'senior') => {
  switch (ageGroup) {
    case 'junior': return 500;
    case 'teen': return 5000;
    case 'senior': return 25000;
    default: return 5000;
  }
};
