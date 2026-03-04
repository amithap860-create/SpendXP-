'use server';
/**
 * @fileOverview A Genkit flow to generate personalized financial literacy flashcards.
 *
 * - generatePersonalizedFlashcards - A function that handles the generation of flashcards based on learner's age.
 * - GenerateFlashcardsInput - The input type for the generatePersonalizedFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generatePersonalizedFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  age: z.number().int().min(8).max(20).describe('The age of the learner, expected between 8 and 20.'),
  numFlashcards: z.number().int().min(1).max(20).optional().default(5).describe('The number of flashcards to generate, default to 5.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The financial term.'),
  definition: z.string().describe('The definition of the financial term, adjusted for the learner\'s age.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of financial literacy flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

const FlashcardPromptInputSchema = GenerateFlashcardsInputSchema.extend({
  difficultyLevel: z.string().describe('The determined difficulty level for the flashcards (e.g., "simple", "medium", "normal").'),
});

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: FlashcardPromptInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert financial literacy educator specializing in creating engaging content for young learners.
Generate {{numFlashcards}} flashcards covering financial terms and concepts.
Adjust the complexity and language for a learner at a "{{difficultyLevel}}" level, given their age of {{age}} years old.
Make sure the definitions are clear, concise, and appropriate for their age group.

Examples of concepts to cover depending on difficulty:
- Simple (8-10 years): Income, Expenses, Savings, Wants vs Needs, Allowance, Bank Account, Basic Budgeting, Earning.
- Medium (11-15 years): Interest, Debt, Credit Score (basic), Investment (introduction), Opportunity Cost, Scarcity, Financial Goals, Types of Banks.
- Normal (16-20 years): Stocks, Bonds, Index Funds, Diversification, Inflation, Compounding Interest, Risk Management, Retirement Planning (basic), Taxes (introduction), Cryptocurrency (basic).

Return the flashcards as a JSON object with a single 'flashcards' key containing an array of objects, where each object has a "term" and a "definition" field.
Example output:
{
  "flashcards": [
    {
      "term": "Income",
      "definition": "Money you earn or receive from work or other sources."
    },
    {
      "term": "Expenses",
      "definition": "Money you spend to buy things or pay for services."
    }
  ]
}
`,
});

const generatePersonalizedFlashcardsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    let difficultyLevel: string;
    if (input.age >= 8 && input.age <= 10) {
      difficultyLevel = 'simple';
    } else if (input.age >= 11 && input.age <= 15) {
      difficultyLevel = 'medium';
    } else if (input.age >= 16 && input.age <= 20) {
      difficultyLevel = 'normal';
    } else {
      // This case should ideally not be hit due to input schema validation (min/max age).
      // As a fallback, default to 'normal'.
      console.warn(`Age ${input.age} is outside the expected range (8-20). Defaulting to 'normal' difficulty.`);
      difficultyLevel = 'normal';
    }

    const { output } = await prompt({ ...input, difficultyLevel });
    return output!;
  }
);

export async function generatePersonalizedFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generatePersonalizedFlashcardsFlow(input);
}
