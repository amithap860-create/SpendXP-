'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { CURRICULUM_MAP, FRAMEWORKS, SOURCE_COLORS, getAgeGroupIncome, type FrameworkId } from '@/data/curriculumMap';
import { getISTDateKey } from '@/lib/dateHelpers';
import { awardBadge } from '@/lib/badgeService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle2,
  Circle,
  Star,
  TrendingUp,
  Target,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Gamepad2,
  ClipboardList,
  GraduationCap,
  Trophy,
} from 'lucide-react';

interface ResourceProgress {
  exploredCards: string[];
  completedInteractions: string[];
  totalXPFromResources: number;
}

interface XPAnimation {
  id: string;
  amount: number;
  x: number;
  y: number;
}

const DailyChallengeCard: React.FC<{ featuredFramework: FrameworkId }> = ({ featuredFramework }) => {
  const framework = FRAMEWORKS.find(f => f.id === featuredFramework);
  if (!framework) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-slate-900">Today's Resource Challenge</h3>
        </div>
        <p className="text-sm text-primary mb-2">
          Complete {framework.name} today for double XP!
        </p>
        <div className="flex items-center gap-2">
          <Badge className={SOURCE_COLORS[framework.source]}>
            {framework.source}
          </Badge>
          <Badge variant="outline" className="text-primary border-[#A8D5BC]">
            2x XP
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const FrameworkCard: React.FC<{
  framework: typeof FRAMEWORKS[0];
  isExpanded: boolean;
  onToggle: () => void;
  progress: ResourceProgress;
  onXPUpdate: (amount: number, x: number, y: number) => void;
  ageGroup: 'junior' | 'teen' | 'senior';
  isDailyChallenge: boolean;
}> = ({ framework, isExpanded, onToggle, progress, onXPUpdate, ageGroup, isDailyChallenge }) => {
  const [interactionState, setInteractionState] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isExplored = progress.exploredCards.includes(framework.id);
  const isCompleted = progress.completedInteractions.includes(framework.id);

  const awardXP = async (amount: number, event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      onXPUpdate(amount, rect.left + rect.width / 2, rect.top);
    }
    
    const { user } = useAuthContext();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentXP = userSnap.data()?.xp || 0;
      const xpAmount = isDailyChallenge ? amount * 2 : amount;
      
      await updateDoc(userRef, {
        xp: currentXP + xpAmount,
        'resourceProgress.totalXPFromResources': (progress.totalXPFromResources || 0) + xpAmount
      });
    } catch (error) {
      console.error('[SpendXP] Error awarding XP:', error);
    }
  };

  const markExplored = async () => {
    if (isExplored) return;
    
    const { user } = useAuthContext();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'resourceProgress.exploredCards': [...progress.exploredCards, framework.id]
      });
      
      awardXP(10);
    } catch (error) {
      console.error('[SpendXP] Error marking explored:', error);
    }
  };

  const markCompleted = async () => {
    if (isCompleted) return;
    
    const { user } = useAuthContext();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'resourceProgress.completedInteractions': [...progress.completedInteractions, framework.id]
      });
      
      awardXP(25);
      
      // Check for Framework Master badge
      if (progress.exploredCards.length + 1 >= 10) {
        await awardBadge(user.uid, 'framework_master');
      }
    } catch (error) {
      console.error('[SpendXP] Error marking completed:', error);
    }
  };

  const handleCardClick = () => {
    if (!isExplored) {
      markExplored();
    }
    onToggle();
  };

  const renderInteractiveElement = () => {
    switch (framework.interactiveType) {
      case 'quiz':
        return <FDICQuiz framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'skills':
        return <FDICSkills framework={framework} onComplete={markCompleted} />;
      case 'timeline':
        return <CFPBTimeline framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'missions':
        return <CFPBTeachMissions framework={framework} onComplete={markCompleted} />;
      case 'progression':
        return <CFPBProgression framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'explorer':
        return <KhanExplorer framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'budget':
        return <KhanBudget framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'domains':
        return <OECDDomains framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'competency':
        return <OECDCompetency framework={framework} ageGroup={ageGroup} onComplete={markCompleted} />;
      case 'rating':
        return <CFPBRating framework={framework} onComplete={markCompleted} />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isCompleted && "bg-[#E8F5EE]/30",
        isExplored && "border-[#A8D5BC]"
      )}
    >
      <CardContent className="p-6">
        {/* Framework Number */}
        <div className="absolute top-4 right-4 text-8xl opacity-6 font-bold text-slate-200">
          {FRAMEWORKS.indexOf(framework) + 1}
        </div>

        {/* Completion Checkmark */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge className={SOURCE_COLORS[framework.source]}>
            {framework.source}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {framework.ageRange}
          </Badge>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <Circle
                key={level}
                className={cn(
                  "h-2 w-2 fill-current",
                  level <= framework.difficulty ? "text-slate-600" : "text-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">{framework.name}</h3>
          <p className="text-slate-600 text-sm mb-3">{framework.description}</p>
          <div className="flex flex-wrap gap-2">
            {framework.topics.map((topic) => (
              <Badge 
                key={topic} 
                variant="secondary" 
                className="text-xs bg-slate-100 text-slate-700"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Related Content */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Related in SpendXP:</p>
          <div className="flex flex-wrap gap-1">
            {CURRICULUM_MAP[framework.id].relatedGames.map((game) => (
              <Button
                key={game}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.location.href = `/games?game=${game}`}
              >
                <Gamepad2 className="h-3 w-3 mr-1" />{game}
              </Button>
            ))}
            {CURRICULUM_MAP[framework.id].relatedQuests.map((quest) => (
              <Button
                key={quest}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.location.href = `/quests?quest=${quest}`}
              >
                <ClipboardList className="h-3 w-3 mr-1" />{quest}
              </Button>
            ))}
            {CURRICULUM_MAP[framework.id].relatedLessons.map((lesson) => (
              <Button
                key={lesson}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => window.location.href = `/learn?lesson=${lesson}`}
              >
                <GraduationCap className="h-3 w-3 mr-1" />{lesson}
              </Button>
            ))}
          </div>
        </div>

        {/* Explore Button */}
        <Button
          onClick={handleCardClick}
          variant="outline"
          className="w-full mb-2"
          suppressHydrationWarning
        >
          {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          {isExplored ? 'Review' : 'Explore'} Framework
        </Button>

        {/* Interactive Element */}
        <div 
          className={cn(
            "transition-all duration-500 overflow-hidden",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {renderInteractiveElement()}
        </div>
      </CardContent>
    </Card>
  );
};

const FDICQuiz: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [showTip, setShowTip] = useState(false);

  const ageOptions = [
    { value: '8-10', label: 'Ages 8-10', tip: 'Start with simple saving habits and basic money counting!' },
    { value: '11-13', label: 'Ages 11-13', tip: 'Learn about budgeting, saving goals, and making smart spending choices!' },
    { value: '14-18', label: 'Ages 14-18', tip: 'Master banking, credit basics, and financial independence skills!' }
  ];

  const handleSelect = (age: string, tip: string) => {
    setSelectedAge(age);
    setShowTip(true);
    onComplete();
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Quick Check: Which age group are you learning for?</h4>
      <div className="space-y-2">
        {ageOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedAge === option.value ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleSelect(option.value, option.tip)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {showTip && (
        <div className="mt-3 p-3 bg-[#E8F5EE] border border-[#A8D5BC] rounded-lg">
          <p className="text-sm text-slate-800">
            <strong>FDIC Tip:</strong> {ageOptions.find(opt => opt.value === selectedAge)?.tip}
          </p>
        </div>
      )}
    </div>
  );
};

const FDICSkills: React.FC<{
  framework: typeof FRAMEWORKS[0];
  onComplete: () => void;
}> = ({ framework, onComplete }) => {
  const [skills, setSkills] = useState({
    bankAccount: false,
    creditScore: false,
    payslip: false
  });

  const handleSkillChange = (skill: keyof typeof skills) => {
    const newSkills = { ...skills, [skill]: !skills[skill] };
    setSkills(newSkills);
    
    if (Object.values(newSkills).filter(Boolean).length >= 2) {
      onComplete();
    }
  };

  const skillCount = Object.values(skills).filter(Boolean).length;

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Real World Skill Check</h4>
      <p className="text-sm text-slate-600 mb-4">
        Mark the skills you already know: {skillCount}/3
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">I know how to open a bank account</label>
          <Switch
            checked={skills.bankAccount}
            onCheckedChange={() => handleSkillChange('bankAccount')}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm">I understand credit scores</label>
          <Switch
            checked={skills.creditScore}
            onCheckedChange={() => handleSkillChange('creditScore')}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm">I can read a payslip</label>
          <Switch
            checked={skills.payslip}
            onCheckedChange={() => handleSkillChange('payslip')}
          />
        </div>
      </div>
      {skillCount >= 2 && (
        <div className="mt-3 p-2 bg-[#E8F5EE] border border-green-200 rounded-lg">
          <p className="text-sm text-primary">Great! You have solid real-world skills!</p>
        </div>
      )}
    </div>
  );
};

const CFPBTimeline: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const stages = [
    { age: '8-10', topics: ['Basic counting', 'Saving coins', 'Needs vs wants'] },
    { age: '11-13', topics: ['Budgeting basics', 'Bank accounts', 'Saving goals'] },
    { age: '14-16', topics: ['Credit basics', 'Part-time jobs', 'Investing intro'] },
    { age: '17-20', topics: ['Financial independence', 'Taxes', 'Advanced planning'] }
  ];

  const getCurrentStage = () => {
    switch (ageGroup) {
      case 'junior': return 0;
      case 'teen': return 2;
      case 'senior': return 3;
      default: return 1;
    }
  };

  const currentStage = getCurrentStage();

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Financial Learning Journey</h4>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div
            key={stage.age}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              index === currentStage 
                ? "border-primary bg-[#E8F5EE]" 
                : "border-slate-200 bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-sm">Ages {stage.age}</h5>
              {index === currentStage && (
                <Badge className="bg-[#C8E8D8] text-slate-800">You are here</Badge>
              )}
            </div>
            <div className="space-y-1">
              {stage.topics.map((topic) => (
                <div key={topic} className="text-xs text-slate-600">
                  • {topic}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} className="w-full mt-4">
        Mark as Reviewed
      </Button>
    </div>
  );
};

const CFPBTeachMissions: React.FC<{
  framework: typeof FRAMEWORKS[0];
  onComplete: () => void;
}> = ({ framework, onComplete }) => {
  const missions = [
    { title: 'Complete a budget for a week', link: '/games?game=budgetBlitz' },
    { title: 'Research one financial product', link: '/learn?lesson=credit' },
    { title: 'Calculate simple interest on a loan', link: '/quests?quest=phone-emi' }
  ];

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Practice Missions</h4>
      <div className="space-y-2">
        {missions.map((mission, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
            <span className="text-sm">{mission.title}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = mission.link}
            >
              Start
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} className="w-full mt-4">
        Missions Reviewed
      </Button>
    </div>
  );
};

const CFPBProgression: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const levels = [
    { level: 1, name: 'Money Basics', skills: ['Counting', 'Saving', 'Spending choices'] },
    { level: 2, name: 'Financial Planning', skills: ['Budgeting', 'Goal setting', 'Banking'] },
    { level: 3, name: 'Advanced Skills', skills: ['Credit', 'Investing', 'Risk management'] },
    { level: 4, name: 'Financial Independence', skills: ['Taxes', 'Insurance', 'Long-term planning'] },
    { level: 5, name: 'Mastery', skills: ['Wealth building', 'Financial leadership', 'Teaching others'] }
  ];

  const getCurrentLevel = () => {
    switch (ageGroup) {
      case 'junior': return 1;
      case 'teen': return 3;
      case 'senior': return 4;
      default: return 1;
    }
  };

  const currentLevel = getCurrentLevel();

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Your Financial Capability Journey</h4>
      <div className="space-y-3">
        {levels.map((level, index) => (
          <div
            key={level.level}
            className={cn(
              "relative p-3 rounded-lg border transition-all",
              index + 1 === currentLevel 
                ? "border-primary bg-[#E8F5EE] ring-2 ring-primary/30" 
                : index + 1 < currentLevel
                ? "border-green-200 bg-[#E8F5EE]"
                : "border-slate-200 bg-white"
            )}
          >
            {index + 1 === currentLevel && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            )}
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-sm">Level {level.level}: {level.name}</h5>
              {index + 1 < currentLevel && <CheckCircle2 className="h-4 w-4 text-primary" />}
              {index + 1 === currentLevel && <Circle className="h-4 w-4 text-primary fill-current" />}
            </div>
            <div className="text-xs text-slate-600">
              {level.skills.join(' • ')}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} className="w-full mt-4">
        Progress Reviewed
      </Button>
    </div>
  );
};

const KhanExplorer: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [exploredTopics, setExploredTopics] = useState<string[]>([]);

  const topics = [
    { 
      id: 'budgeting', 
      title: 'Budgeting', 
      explanations: {
        junior: 'A plan for how to use your money wisely. Think of it as a roadmap for your pocket money!',
        teen: 'Creating a spending plan that balances your needs, wants, and savings. Essential for financial independence.',
        senior: 'Strategic allocation of income across expenses, investments, and goals. Foundation of financial planning.'
      }
    },
    { 
      id: 'saving', 
      title: 'Saving', 
      explanations: {
        junior: 'Putting money aside for things you want later. Like saving for a toy or game!',
        teen: 'Building emergency funds and saving for major purchases. Your financial safety net.',
        senior: 'Systematic wealth accumulation through various saving vehicles and investment strategies.'
      }
    },
    { 
      id: 'debt', 
      title: 'Debt', 
      explanations: {
        junior: 'Borrowing money that you must pay back. Be very careful with debt!',
        teen: 'Understanding loans, credit cards, and interest. Debt can be a tool or a trap.',
        senior: 'Leveraging debt strategically while managing risk. Understanding good vs bad debt.'
      }
    },
    { 
      id: 'insurance', 
      title: 'Insurance', 
      explanations: {
        junior: 'Paying a little bit now to protect against big problems later. Like a safety shield!',
        teen: 'Protection against unexpected costs. Understanding premiums, deductibles, and coverage.',
        senior: 'Risk management through insurance products. Asset protection and financial security planning.'
      }
    },
    { 
      id: 'investing', 
      title: 'Investing', 
      explanations: {
        junior: 'Making your money grow by putting it to work. Like planting money seeds!',
        teen: 'Growing your money through stocks, bonds, and other investments. Power of compounding.',
        senior: 'Portfolio management, asset allocation, and long-term wealth building strategies.'
      }
    },
    { 
      id: 'banking', 
      title: 'Banking', 
      explanations: {
        junior: 'A safe place to keep your money and help it grow. Like a money home!',
        teen: 'Understanding banking services, accounts, and how banks work. Your financial toolkit.',
        senior: 'Banking relationships, services, and integration with comprehensive financial planning.'
      }
    }
  ];

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    if (!exploredTopics.includes(topicId)) {
      setExploredTopics([...exploredTopics, topicId]);
    }
  };

  const topic = topics.find(t => t.id === selectedTopic);

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Explore Financial Topics</h4>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {topics.map((topic) => (
          <Button
            key={topic.id}
            variant={selectedTopic === topic.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => handleTopicClick(topic.id)}
          >
            {topic.title}
            {exploredTopics.includes(topic.id) && <CheckCircle2 className="h-3 w-3 ml-1" />}
          </Button>
        ))}
      </div>
      {topic && (
        <div className="p-3 bg-white rounded-lg border">
          <h5 className="font-semibold mb-2">{topic.title}</h5>
          <p className="text-sm text-slate-600">
            {topic.explanations[ageGroup]}
          </p>
        </div>
      )}
      {exploredTopics.length >= 3 && (
        <Button onClick={onComplete} className="w-full mt-4">
          Topics Explored
        </Button>
      )}
    </div>
  );
};

const KhanBudget: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const income = getAgeGroupIncome(ageGroup);
  const [values, setValues] = useState([50, 30, 20]); // Needs, Wants, Savings
  const [feedback, setFeedback] = useState('');

  const updateFeedback = (savings: number) => {
    if (savings < 20) {
      setFeedback('Try to save more! Aim for at least 20%.');
    } else if (savings <= 30) {
      setFeedback('Good balance! You\'re saving appropriately.');
    } else {
      setFeedback('Excellent saver! You\'re building great financial habits.');
    }
  };

  const handleValueChange = (newValue: number[]) => {
    setValues(newValue);
    updateFeedback(newValue[2]);
  };

  const applyBudget = () => {
    onComplete();
  };

  const amounts = values.map(v => Math.round(income * v / 100));

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Monthly Budget Planner</h4>
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-2">
          Monthly Income: <strong>₹{income.toLocaleString('en-IN')}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm">Needs (Essential expenses)</label>
              <span className="text-sm font-semibold">₹{amounts[0].toLocaleString('en-IN')}</span>
            </div>
            <Slider
              value={[values[0]]}
              onValueChange={(v) => handleValueChange([v[0], values[1], 100 - v[0] - values[1]])}
              max={70}
              min={30}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm">Wants (Fun & entertainment)</label>
              <span className="text-sm font-semibold">₹{amounts[1].toLocaleString('en-IN')}</span>
            </div>
            <Slider
              value={[values[1]]}
              onValueChange={(v) => handleValueChange([values[0], v[0], 100 - values[0] - v[0]])}
              max={40}
              min={10}
              step={5}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm">Savings (Future goals)</label>
              <span className="text-sm font-semibold">₹{amounts[2].toLocaleString('en-IN')}</span>
            </div>
            <Slider
              value={[values[2]]}
              onValueChange={(v) => handleValueChange([100 - v[0] - values[1], values[1], v[0]])}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">
          Total: {values.reduce((a, b) => a + b, 0)}%
        </div>
      </div>
      {feedback && (
        <div className={cn(
          "p-2 rounded-lg border mb-4",
          values[2] >= 20 ? "bg-[#E8F5EE] border-green-200 text-primary" : "bg-[#E8F5EE] border-[#A8D5BC] text-[#1A4035]"
        )}>
          {feedback}
        </div>
      )}
      <Button onClick={applyBudget} className="w-full">
        Apply this Budget (+25 XP)
      </Button>
    </div>
  );
};

const OECDDomains: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [exploredDomains, setExploredDomains] = useState<string[]>([]);

  const domains = [
    {
      id: 'money',
      name: 'Money & Transactions',
      competencies: {
        junior: ['Counting money', 'Making payments', 'Understanding prices'],
        teen: ['Banking operations', 'Digital payments', 'Currency exchange'],
        senior: ['Advanced transactions', 'International finance', 'Cryptocurrency basics']
      }
    },
    {
      id: 'planning',
      name: 'Planning & Managing',
      competencies: {
        junior: ['Basic budgeting', 'Saving goals', 'Simple planning'],
        teen: ['Advanced budgeting', 'Financial planning', 'Goal setting'],
        senior: ['Comprehensive planning', 'Investment planning', 'Retirement planning']
      }
    },
    {
      id: 'risk',
      name: 'Risk & Reward',
      competencies: {
        junior: ['Basic risk awareness', 'Safety with money', 'Simple decisions'],
        teen: ['Risk assessment', 'Insurance basics', 'Investment risk'],
        senior: ['Risk management', 'Insurance planning', 'Risk-reward analysis']
      }
    },
    {
      id: 'landscape',
      name: 'Financial Landscape',
      competencies: {
        junior: ['Banks and money', 'Shopping choices', 'Basic economics'],
        teen: ['Financial institutions', 'Market understanding', 'Economic concepts'],
        senior: ['Financial systems', 'Market analysis', 'Global economics']
      }
    }
  ];

  const handleDomainClick = (domainId: string) => {
    if (expandedDomain === domainId) {
      setExpandedDomain(null);
    } else {
      setExpandedDomain(domainId);
      if (!exploredDomains.includes(domainId)) {
        setExploredDomains([...exploredDomains, domainId]);
      }
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Financial Competence Domains</h4>
      <div className="grid grid-cols-2 gap-3">
        {domains.map((domain) => (
          <div key={domain.id}>
            <Button
              variant={expandedDomain === domain.id ? "default" : "outline"}
              className="w-full h-auto p-3 flex flex-col items-start"
              onClick={() => handleDomainClick(domain.id)}
            >
              <span className="font-semibold text-sm">{domain.name}</span>
              {exploredDomains.includes(domain.id) && <CheckCircle2 className="h-3 w-3 mt-1" />}
            </Button>
            {expandedDomain === domain.id && (
              <div className="mt-2 p-2 bg-white rounded border text-xs">
                {domain.competencies[ageGroup].map((competency) => (
                  <div key={competency} className="py-1">• {competency}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {exploredDomains.length >= 2 && (
        <Button onClick={onComplete} className="w-full mt-4">
          Domains Explored
        </Button>
      )}
    </div>
  );
};

const OECDCompetency: React.FC<{
  framework: typeof FRAMEWORKS[0];
  ageGroup: 'junior' | 'teen' | 'senior';
  onComplete: () => void;
}> = ({ framework, ageGroup, onComplete }) => {
  const competencyMap = {
    junior: {
      'Money & Transactions': ['Basic counting', 'Simple payments', 'Price recognition'],
      'Planning & Managing': ['Pocket money budget', 'Saving goals', 'Basic planning'],
      'Risk & Reward': ['Money safety', 'Simple choices', 'Basic awareness'],
      'Financial Landscape': ['Banks', 'Shops', 'Money concepts']
    },
    teen: {
      'Money & Transactions': ['Banking', 'Digital payments', 'Exchange rates'],
      'Planning & Managing': ['Advanced budgeting', 'Financial goals', 'Planning skills'],
      'Risk & Reward': ['Risk assessment', 'Insurance', 'Investment risk'],
      'Financial Landscape': ['Financial institutions', 'Markets', 'Economics']
    },
    senior: {
      'Money & Transactions': ['Complex transactions', 'International finance', 'Digital assets'],
      'Planning & Managing': ['Comprehensive planning', 'Investment planning', 'Retirement'],
      'Risk & Reward': ['Risk management', 'Advanced insurance', 'Risk analysis'],
      'Financial Landscape': ['Financial systems', 'Market analysis', 'Global economics']
    }
  };

  const userCompetencies = competencyMap[ageGroup];

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Your Financial Competency Map</h4>
      <div className="space-y-3">
        {Object.entries(userCompetencies).map(([domain, competencies]) => (
          <div key={domain} className="border rounded-lg p-3">
            <h5 className="font-semibold text-sm mb-2">{domain}</h5>
            <div className="grid grid-cols-1 gap-1">
              {competencies.map((competency) => (
                <div key={competency} className="text-xs text-slate-600 flex items-center">
                  <CheckCircle2 className="h-3 w-3 text-primary mr-2" />
                  {competency}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} className="w-full mt-4">
        Competency Map Reviewed
      </Button>
    </div>
  );
};

const CFPBRating: React.FC<{
  framework: typeof FRAMEWORKS[0];
  onComplete: () => void;
}> = ({ framework, onComplete }) => {
  const [ratings, setRatings] = useState({
    content: 0,
    quality: 0,
    utility: 0,
    effectiveness: 0
  });

  const criteria = [
    { key: 'content', label: 'Content Quality' },
    { key: 'quality', label: 'Educational Quality' },
    { key: 'utility', label: 'Practical Utility' },
    { key: 'effectiveness', label: 'Learning Effectiveness' }
  ];

  const handleRating = (key: keyof typeof ratings, value: number) => {
    setRatings({ ...ratings, [key]: value });
  };

  const submitRatings = () => {
    const allRated = Object.values(ratings).every(r => r > 0);
    if (allRated) {
      onComplete();
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h4 className="font-semibold mb-3">Rate SpendXP's Financial Education</h4>
      <p className="text-sm text-slate-600 mb-4">
        Help us improve by rating these key aspects:
      </p>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <div key={criterion.key}>
            <div className="flex justify-between mb-1">
              <label className="text-sm">{criterion.label}</label>
              <span className="text-sm font-semibold">{ratings[criterion.key as keyof typeof ratings]}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(criterion.key as keyof typeof ratings, star)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      star <= ratings[criterion.key as keyof typeof ratings]
                        ? "fill-yellow-400 text-[#A8D5BC]"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button 
        onClick={submitRatings} 
        className="w-full mt-4"
        disabled={!Object.values(ratings).every(r => r > 0)}
      >
        Submit Rating (+15 XP)
      </Button>
    </div>
  );
};

export default function ResourcesPage() {
  const { user, loading: authLoading, currentAgeGroup } = useAuthContext();
  const router = useRouter();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [resourceProgress, setResourceProgress] = useState<ResourceProgress>({
    exploredCards: [],
    completedInteractions: [],
    totalXPFromResources: 0
  });
  const [xpAnimations, setXpAnimations] = useState<XPAnimation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Resources | SpendXP';
  }, []);

  const getDailyChallengeFramework = (): FrameworkId => {
    const dateKey = getISTDateKey();
    const frameworkIndex = parseInt(dateKey.slice(-2)) % 10;
    return FRAMEWORKS[frameworkIndex].id;
  };

  const dailyChallengeFramework = getDailyChallengeFramework();

  useEffect(() => {
    if (!user) return;

    const loadResourceProgress = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        if (userData?.resourceProgress) {
          setResourceProgress(userData.resourceProgress);
        }
      } catch (error) {
        console.error('[SpendXP] Error loading resource progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResourceProgress();
  }, [user]);

  const handleCardToggle = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleXPUpdate = (amount: number, x: number, y: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setXpAnimations(prev => [...prev, { id, amount, x, y }]);
    
    setTimeout(() => {
      setXpAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 2000);
  };

  const getSubtitle = () => {
    switch (currentAgeGroup) {
      case 'junior':
        return 'Discover how money works — one topic at a time!';
      case 'teen':
        return 'Build real money skills used by adults every day.';
      case 'senior':
        return 'Master the financial frameworks that banks and governments use.';
      default:
        return 'Build your financial literacy with expert-curated content.';
    }
  };

  const progressPercentage = (resourceProgress.exploredCards.length / 10) * 100;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <style jsx>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        .xp-float {
          animation: floatUp 2s ease-out forwards;
        }
      `}</style>
      
      {/* XP Animations */}
      {xpAnimations.map((anim) => (
        <div
          key={anim.id}
          className="fixed pointer-events-none z-50 text-primary font-bold text-lg xp-float"
          style={{ left: anim.x, top: anim.y }}
        >
          +{anim.amount} XP
        </div>
      ))}

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Financial Learning Library
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            {getSubtitle()}
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Resources Explored</span>
              <span>{resourceProgress.exploredCards.length}/10</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* XP Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F5EE] border border-[#A8D5BC] rounded-full">
            <Sparkles className="h-4 w-4 text-[#2E7D5A]" />
            <span className="text-sm font-semibold text-[#1A4035]">
              Earn XP by exploring resources ({resourceProgress.totalXPFromResources || 0} XP earned)
            </span>
          </div>
        </div>

        {/* Daily Challenge */}
        <DailyChallengeCard featuredFramework={dailyChallengeFramework} />

        {/* Framework Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FRAMEWORKS.map((framework) => (
            <FrameworkCard
              key={framework.id}
              framework={framework}
              isExpanded={expandedCard === framework.id}
              onToggle={() => handleCardToggle(framework.id)}
              progress={resourceProgress}
              onXPUpdate={handleXPUpdate}
              ageGroup={currentAgeGroup}
              isDailyChallenge={framework.id === dailyChallengeFramework}
            />
          ))}
        </div>

        {/* Completion Bonus */}
        {resourceProgress.exploredCards.length >= 10 && !resourceProgress.completedInteractions.includes('all_cards_explored') && (
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-blue-50 border-2 border-[#A8D5BC] rounded-2xl text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Framework Master Achievement!
            </h3>
            <p className="text-primary mb-4">
              You've explored all 10 financial literacy frameworks! You've earned the Framework Master badge and 150 XP.
            </p>
            <Button 
              onClick={async () => {
                if (user) {
                  await awardBadge(user.uid, 'framework_master');
                  const userRef = doc(db, 'users', user.uid);
                  const userSnap = await getDoc(userRef);
                  const currentXP = userSnap.data()?.xp || 0;
                  await updateDoc(userRef, {
                    'resourceProgress.completedInteractions': [...resourceProgress.completedInteractions, 'all_cards_explored'],
                    xp: currentXP + 150
                  });
                }
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Claim Badge & Reward
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
