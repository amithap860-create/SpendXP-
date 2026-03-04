'use server';
/**
 * @fileOverview A Genkit flow that generates simplified news events for a virtual stock market
 * simulation and provides educational pop-ups explaining financial concepts.
 *
 * - generateMarketNewsAndExplanations - A function that handles the generation of market news and explanations.
 * - GenerateMarketNewsInput - The input type for the generateMarketNewsAndExplanations function.
 * - GenerateMarketNewsOutput - The return type for the generateMarketNewsAndExplanations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMarketNewsInputSchema = z.object({
  marketDescription: z
    .string()
    .describe('A general description of the current market conditions or recent events.'),
  ageGroup: z
    .enum(['8-11', '11-15', '16-20'])
    .describe('The age group of the user to tailor the explanations (8-11: simple, 11-15: medium, 16-20: normal).'),
  fictionalCompanies: z
    .array(z.string())
    .describe('A list of fictional company names that can be impacted by the news event.'),
});
export type GenerateMarketNewsInput = z.infer<typeof GenerateMarketNewsInputSchema>;

const GenerateMarketNewsOutputSchema = z.object({
  newsEventTitle: z.string().describe('A catchy title for the simplified news event.'),
  newsEventContent: z
    .string()
    .describe(
      'A short, simplified news event that could impact the virtual stock market. Keep it simple and age-appropriate.'
    ),
  impactedCompany: z
    .string()
    .optional()
    .describe('The name of the fictional company specifically impacted by this news event, if any. Must be one from the provided list.'),
  impactDirection: z
    .enum(['positive', 'negative', 'neutral'])
    .describe('Indicates whether the news event has a positive, negative, or neutral impact on the market/company.'),
  explanationTitle: z.string().describe('A title for the educational pop-up related to the news event.'),
  explanationContent: z
    .string()
    .describe(
      'Educational content explaining a financial concept (e.g., volatility, supply/demand, investment strategies) related to the news event, tailored to the specified age group. Use simple language.'
    ),
});
export type GenerateMarketNewsOutput = z.infer<typeof GenerateMarketNewsOutputSchema>;

export async function generateMarketNewsAndExplanations(
  input: GenerateMarketNewsInput
): Promise<GenerateMarketNewsOutput> {
  return generateMarketNewsAndExplanationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketNewsPrompt',
  input: { schema: GenerateMarketNewsInputSchema },
  output: { schema: GenerateMarketNewsOutputSchema },
  prompt: `You are an AI assistant for a financial literacy app called SpendXP for kids aged 8-20. Your task is to generate a simplified news event for a virtual stock market simulation and an educational pop-up explaining a relevant financial concept.

Consider the following:
- Current market description: {{{marketDescription}}}
- User age group: {{{ageGroup}}} (This should guide the complexity and vocabulary of the explanation).
- Available fictional companies: {{{fictionalCompanies}}} (If a company is impacted, it must be one from this list).

Generate a single, short news event that is easy for kids to understand. This event should hint at a reason for a stock price change or market movement.
Then, generate an educational pop-up that explains a financial concept relevant to the news event (e.g., supply and demand, volatility, diversification, company earnings, market sentiment). The explanation should be tailored to the specified age group (8-11: very simple, 11-15: medium, 16-20: more detailed but still accessible).

Example for Age Group 8-11:
News Event Title: "Shiny Toy Co. Makes New Super Robot!"
News Event Content: "Shiny Toy Co. announced a brand new robot that everyone wants! Kids are lining up to buy it. What do you think will happen to their stock?"
Impacted Company: "Shiny Toy Co."
ImpactDirection: "positive"
Explanation Title: "What is Supply and Demand?"
Explanation Content: "Imagine everyone wants the new robot! When lots of people want something (high demand) and there's not much of it yet (low supply), the price usually goes up. This can make the company's stock value go up too!"

Example for Age Group 16-20:
News Event Title: "Tech Innovations Inc. Reveals Unexpected Quarterly Earnings"
News Event Content: "Tech Innovations Inc. today reported its quarterly earnings, surprising analysts with higher-than-expected profits due to strong sales in their AI division. This news is expected to influence investor confidence."
Impacted Company: "Tech Innovations Inc."
ImpactDirection: "positive"
Explanation Title: "Understanding Quarterly Earnings"
Explanation Content: "Quarterly earnings reports are like report cards for public companies, released every three months. They show how much money a company made or lost. When earnings are better than expected, investors often become more confident in the company, driving the stock price up. This is a key factor in market sentiment."

Now, generate the news event and explanation based on the provided inputs.`,
});

const generateMarketNewsAndExplanationsFlow = ai.defineFlow(
  {
    name: 'generateMarketNewsAndExplanationsFlow',
    inputSchema: GenerateMarketNewsInputSchema,
    outputSchema: GenerateMarketNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate market news and explanations.');
    }
    return output;
  }
);
