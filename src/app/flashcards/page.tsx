"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generatePersonalizedFlashcards } from '@/ai/flows/generate-personalized-flashcards';
import { LoaderCircle, RefreshCw, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export default function Flashcards() {
  const { age } = useUser();
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      const result = await generatePersonalizedFlashcards({ age, numFlashcards: 8 });
      setFlashcards(result.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [age]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center max-w-4xl mx-auto pb-24 md:pb-8">
        <div className="text-center mb-12 w-full">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border mb-4 text-xs font-bold text-accent">
            <Zap className="h-3 w-3" />
            AI-TAILORED FOR YOUR AGE ({age})
          </div>
          <h2 className="text-4xl font-bold text-primary mb-2">Finance Flashcards</h2>
          <p className="text-muted-foreground">Master key concepts one card at a time.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium text-primary">Creating personalized study set...</p>
          </div>
        ) : flashcards.length > 0 ? (
          <div className="w-full max-w-2xl space-y-8">
            <div 
              className="relative h-80 w-full perspective-1000 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center shadow-xl border-none bg-white">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Term</span>
                  <h3 className="text-3xl font-extrabold text-primary">{flashcards[currentIndex].term}</h3>
                  <p className="mt-8 text-sm text-accent font-bold">Click to flip</p>
                </Card>
                {/* Back */}
                <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center shadow-xl border-none bg-primary text-white rotate-y-180">
                  <span className="text-xs font-bold text-primary-foreground/50 uppercase tracking-widest mb-6">Definition</span>
                  <p className="text-xl leading-relaxed font-medium">{flashcards[currentIndex].definition}</p>
                </Card>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                variant="outline" 
                size="lg"
                className="rounded-full h-12 w-12 p-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="text-sm font-bold text-muted-foreground">
                Card {currentIndex + 1} of {flashcards.length}
              </div>
              <Button 
                onClick={handleNext} 
                disabled={currentIndex === flashcards.length - 1}
                variant="outline" 
                size="lg"
                className="rounded-full h-12 w-12 p-0"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex justify-center pt-8">
              <Button onClick={fetchFlashcards} variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
                <RefreshCw className="h-4 w-4" />
                Generate New Cards
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p>No flashcards found. Try refreshing.</p>
            <Button onClick={fetchFlashcards} className="mt-4">Retry</Button>
          </div>
        )}
      </main>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
